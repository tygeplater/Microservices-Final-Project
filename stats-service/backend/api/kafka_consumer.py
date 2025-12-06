from kafka import KafkaConsumer
import json
import logging
from .database import SessionLocal, APIUsage, init_db
from datetime import datetime
import os
import threading

logger = logging.getLogger(__name__)

class StatsKafkaConsumer:
    def __init__(self):
        kafka_server_endpoint = os.getenv('KAFKA_SERVER_ENDPOINT', 'localhost:9092')
        kafka_api_key = os.getenv('KAFKA_API_KEY')
        kafka_api_secret = os.getenv('KAFKA_API_SECRET')
        self.running = False
        self.consumer_thread = None
        
        try:
            consumer_config = {
                'bootstrap_servers': [kafka_server_endpoint],
                'value_deserializer': lambda m: json.loads(m.decode('utf-8')),
                'group_id': 'stats-service-group',
                'auto_offset_reset': 'earliest',
                'enable_auto_commit': True,
            }
            
            if kafka_api_key and kafka_api_secret:
                consumer_config.update({
                    'security_protocol': 'SASL_SSL',
                    'sasl_mechanism': 'PLAIN',
                    'sasl_plain_username': kafka_api_key,
                    'sasl_plain_password': kafka_api_secret,
                })
                logger.info("Using SASL authentication for Kafka")
            
            self.consumer = KafkaConsumer('api-usage', **consumer_config)
            
            logger.info(f"Kafka consumer connected to {kafka_server_endpoint}")
        except Exception as e:
            logger.error(f"Failed to connect to Kafka: {e}")
            self.consumer = None

    def start(self):
        """Start consuming messages in a background thread"""
        if not self.consumer:
            logger.warning("Kafka consumer not initialized")
            return
            
        self.running = True
        self.consumer_thread = threading.Thread(target=self._consume, daemon=True)
        self.consumer_thread.start()
        logger.info("Kafka consumer started")

    def _consume(self):
        """Consume messages and store in database"""
        init_db()  # Ensure tables exist
        
        for message in self.consumer:
            if not self.running:
                break
                
            try:
                event = message.value
                self._store_usage_event(event)
            except Exception as e:
                logger.error(f"Error processing message: {e}")

    def _store_usage_event(self, event: dict):
        """Store usage event in PostgreSQL"""
        db = SessionLocal()
        try:
            usage = APIUsage(
                service=event.get('service'),
                endpoint=event.get('endpoint'),
                method=event.get('method'),
                status_code=event.get('status_code'),
                response_time_ms=event.get('response_time_ms'),
                timestamp=datetime.fromisoformat(event.get('timestamp')),
                user_agent=event.get('user_agent'),
                query_params=event.get('query_params')
            )
            db.add(usage)
            db.commit()
            logger.debug(f"Stored usage event for {event.get('endpoint')}")
        except Exception as e:
            logger.error(f"Failed to store usage event: {e}")
            db.rollback()
        finally:
            db.close()

    def stop(self):
        """Stop the consumer"""
        self.running = False
        if self.consumer:
            self.consumer.close()
        logger.info("Kafka consumer stopped")

# Global consumer instance
kafka_consumer = StatsKafkaConsumer()