from kafka import KafkaProducer
import json
import logging
from datetime import datetime
from typing import Optional
import os
import time

logger = logging.getLogger(__name__)


class F1KafkaProducer:
    def __init__(self, retries: int = 5, delay_seconds: float = 3.0) -> None:
        self.kafka_server_endpoint = os.getenv('KAFKA_SERVER_ENDPOINT', 'kafka:9092')
        self.retries = retries
        self.delay_seconds = delay_seconds

        # Always define the attribute so we never get AttributeError
        self.producer: Optional[KafkaProducer] = None

        # Try to connect on startup (but don't crash the app if it fails)
        self._connect_with_retry()

    def _connect_with_retry(self) -> None:
        """Attempt to create a KafkaProducer with simple retry logic."""
        for attempt in range(1, self.retries + 1):
            try:
                logger.info(
                    f"Connecting to Kafka at {self.kafka_server_endpoint} "
                    f"(attempt {attempt}/{self.retries})"
                )
                self.producer = KafkaProducer(
                    bootstrap_servers=[self.kafka_server_endpoint],
                    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                )
                logger.info(f"Kafka producer connected to {self.kafka_server_endpoint}")
                return
            except Exception as e:
                logger.warning(f"Failed to connect to Kafka: {e}")
                self.producer = None
                if attempt < self.retries:
                    time.sleep(self.delay_seconds)
                else:
                    logger.error(
                        f"Giving up connecting to Kafka after {self.retries} attempts"
                    )

    def send_usage_event(
        self,
        endpoint: str,
        method: str,
        status_code: int,
        response_time: float,
        user_agent: Optional[str] = None,
        query_params: Optional[dict] = None,
    ) -> None:
        """Send a usage event to Kafka."""
        # If we don't have a producer (e.g., Kafka was down at startup),
        # try once more to connect before giving up on this send.
        if self.producer is None:
            logger.info("Kafka producer not initialized; attempting to reconnect...")
            self._connect_with_retry()

        if self.producer is None:
            logger.warning("Kafka producer still unavailable, skipping event")
            return

        event = {
            "service": "f1-service",
            "endpoint": endpoint,
            "method": method,
            "status_code": status_code,
            "response_time_ms": response_time,
            "timestamp": datetime.now().isoformat(),
            "user_agent": user_agent,
            "query_params": query_params,
        }

        try:
            future = self.producer.send('api-usage', value=event)
            future.get(timeout=10)  # Wait for confirmation
            logger.debug(f"Sent usage event for {endpoint}")
        except Exception as e:
            logger.error(f"Failed to send Kafka message: {e}")

    def close(self) -> None:
        # Close only if we actually have a producer
        if self.producer is not None:
            try:
                self.producer.flush()
                self.producer.close()
            except Exception as e:
                logger.error(f"Error while closing Kafka producer: {e}")
            finally:
                self.producer = None


# Global producer instance
kafka_producer = F1KafkaProducer()
