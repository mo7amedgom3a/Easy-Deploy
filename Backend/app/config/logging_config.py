import logging
import logging.handlers
import os
import sys
from pathlib import Path

def setup_logging():
    """Configure logging for the application."""
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    # Create formatters
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    )

    # File handler for all logs
    all_logs_handler = logging.handlers.RotatingFileHandler(
        log_dir / "app.log",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    all_logs_handler.setLevel(logging.INFO)
    all_logs_handler.setFormatter(file_formatter)

    # File handler for errors
    error_logs_handler = logging.handlers.RotatingFileHandler(
        log_dir / "error.log",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    error_logs_handler.setLevel(logging.ERROR)
    error_logs_handler.setFormatter(file_formatter)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(console_formatter)

    # Add handlers to root logger
    root_logger.addHandler(all_logs_handler)
    root_logger.addHandler(error_logs_handler)
    root_logger.addHandler(console_handler)

    # Capture stdout and stderr
    sys.stdout = LoggerWriter(root_logger.info)
    sys.stderr = LoggerWriter(root_logger.error)

    # Set specific logger levels
    logging.getLogger('uvicorn').setLevel(logging.INFO)
    logging.getLogger('uvicorn.access').setLevel(logging.INFO)
    logging.getLogger('uvicorn.error').setLevel(logging.ERROR)

    # Create loggers for specific components
    loggers = {
        'git': logging.getLogger('git'),
        'deploy': logging.getLogger('deploy'),
        'aws': logging.getLogger('aws'),
        'database': logging.getLogger('database'),
        'api': logging.getLogger('api')
    }

    # Configure each component logger
    for logger in loggers.values():
        logger.setLevel(logging.INFO)
        logger.propagate = True  # Propagate logs to root logger

    return loggers

class LoggerWriter:
    """Helper class to redirect stdout/stderr to logger."""
    def __init__(self, log_function):
        self.log_function = log_function
        self.buffer = []

    def write(self, message):
        if message and not message.isspace():
            self.log_function(message.rstrip())

    def flush(self):
        pass