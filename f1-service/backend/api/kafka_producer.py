from kafka import KafkaProducer
import json
import logging
from datetime import datetime
from typing import Optional
import os

logger = logging.getLogger(__name__)

class F1KafkaProducer:
    def __init__(self):
        kafka_server_endpoint = os.getenv('KAFKA_SERVER_ENDPOINT', 'localhost:9092')
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=[kafka_server_endpoint], 
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )
            
            logger.info(f"Kafka producer connected to {kafka_server_endpoint}")
        except Exception as e:
            logger.error(f"Failed to connect to Kafka: {e}")

    def send_usage_event(self, endpoint: str, method: str, status_code: int, 
                        response_time: float, user_agent: Optional[str] = None, query_params: Optional[dict] = None
                        ):
        """Send a usage event to Kafka"""
        if not self.producer:
            logger.warning("Kafka producer not initialized, skipping event")
            return

        event = {
            "service": "f1-service",
            "endpoint": endpoint,
            "method": method,
            "status_code": status_code,
            "response_time_ms": response_time,
            "timestamp": datetime.now().isoformat(),
            "user_agent": user_agent,
            "query_params": query_params
        }

        try:
            future = self.producer.send('api-usage', value=event)
            future.get(timeout=10)  # Wait for confirmation
            logger.debug(f"Sent usage event for {endpoint}")
        except Exception as e:
            logger.error(f"Failed to send Kafka message: {e}")

    def close(self):
        if self.producer:
            self.producer.flush()
            self.producer.close()
            self.producer = None

# Global producer instance
kafka_producer = F1KafkaProducer()