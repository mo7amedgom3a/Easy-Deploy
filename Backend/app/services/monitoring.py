import boto3
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

logger = logging.getLogger('monitoring')

class MonitoringService:
    def __init__(self):
        self.cloudwatch = boto3.client('cloudwatch')
        self.ecs = boto3.client('ecs')

    async def get_cluster_metrics(self, cluster_name: str, start_time: Optional[datetime] = None, end_time: Optional[datetime] = None) -> Dict:
        """Get metrics for an ECS cluster."""
        if not end_time:
            end_time = datetime.utcnow()
        if not start_time:
            start_time = end_time - timedelta(hours=1)

        metrics = {
            'cpu_utilization': self._get_metric_statistics(
                'AWS/ECS',
                'CPUUtilization',
                cluster_name,
                start_time,
                end_time
            ),
            'memory_utilization': self._get_metric_statistics(
                'AWS/ECS',
                'MemoryUtilization',
                cluster_name,
                start_time,
                end_time
            ),
            'network_bytes': self._get_metric_statistics(
                'AWS/ECS',
                'NetworkRxBytes',
                cluster_name,
                start_time,
                end_time
            )
        }

        return metrics

    async def get_service_metrics(self, cluster_name: str, service_name: str, start_time: Optional[datetime] = None, end_time: Optional[datetime] = None) -> Dict:
        """Get metrics for an ECS service."""
        if not end_time:
            end_time = datetime.utcnow()
        if not start_time:
            start_time = end_time - timedelta(hours=1)

        metrics = {
            'cpu_utilization': self._get_metric_statistics(
                'AWS/ECS',
                'CPUUtilization',
                cluster_name,
                start_time,
                end_time,
                dimensions=[{'Name': 'ServiceName', 'Value': service_name}]
            ),
            'memory_utilization': self._get_metric_statistics(
                'AWS/ECS',
                'MemoryUtilization',
                cluster_name,
                start_time,
                end_time,
                dimensions=[{'Name': 'ServiceName', 'Value': service_name}]
            ),
            'network_bytes': self._get_metric_statistics(
                'AWS/ECS',
                'NetworkRxBytes',
                cluster_name,
                start_time,
                end_time,
                dimensions=[{'Name': 'ServiceName', 'Value': service_name}]
            ),
            'running_tasks': self._get_metric_statistics(
                'AWS/ECS',
                'RunningTaskCount',
                cluster_name,
                start_time,
                end_time,
                dimensions=[{'Name': 'ServiceName', 'Value': service_name}]
            )
        }

        return metrics

    async def get_task_metrics(self, cluster_name: str, task_id: str, start_time: Optional[datetime] = None, end_time: Optional[datetime] = None) -> Dict:
        """Get metrics for a specific ECS task."""
        if not end_time:
            end_time = datetime.utcnow()
        if not start_time:
            start_time = end_time - timedelta(hours=1)

        metrics = {
            'cpu_utilization': self._get_metric_statistics(
                'AWS/ECS',
                'CPUUtilization',
                cluster_name,
                start_time,
                end_time,
                dimensions=[{'Name': 'TaskId', 'Value': task_id}]
            ),
            'memory_utilization': self._get_metric_statistics(
                'AWS/ECS',
                'MemoryUtilization',
                cluster_name,
                start_time,
                end_time,
                dimensions=[{'Name': 'TaskId', 'Value': task_id}]
            ),
            'network_bytes': self._get_metric_statistics(
                'AWS/ECS',
                'NetworkRxBytes',
                cluster_name,
                start_time,
                end_time,
                dimensions=[{'Name': 'TaskId', 'Value': task_id}]
            )
        }

        return metrics

    def _get_metric_statistics(
        self,
        namespace: str,
        metric_name: str,
        cluster_name: str,
        start_time: datetime,
        end_time: datetime,
        dimensions: Optional[List[Dict]] = None
    ) -> List[Dict]:
        """Get metric statistics from CloudWatch."""
        try:
            base_dimensions = [{'Name': 'ClusterName', 'Value': cluster_name}]
            if dimensions:
                base_dimensions.extend(dimensions)

            response = self.cloudwatch.get_metric_statistics(
                Namespace=namespace,
                MetricName=metric_name,
                Dimensions=base_dimensions,
                StartTime=start_time,
                EndTime=end_time,
                Period=300,  # 5 minutes
                Statistics=['Average', 'Maximum', 'Minimum']
            )

            return response.get('Datapoints', [])
        except Exception as e:
            logger.error(f"Error fetching metric {metric_name}: {str(e)}")
            return []

    async def get_service_status(self, cluster_name: str, service_name: str) -> Dict:
        """Get current status of an ECS service."""
        try:
            response = self.ecs.describe_services(
                cluster=cluster_name,
                services=[service_name]
            )
            
            if not response['services']:
                return {'error': 'Service not found'}

            service = response['services'][0]
            return {
                'status': service['status'],
                'running_count': service['runningCount'],
                'desired_count': service['desiredCount'],
                'pending_count': service['pendingCount'],
                'last_updated': service['lastUpdated'].isoformat(),
                'events': service.get('events', [])[:5]  # Last 5 events
            }
        except Exception as e:
            logger.error(f"Error fetching service status: {str(e)}")
            return {'error': str(e)} 