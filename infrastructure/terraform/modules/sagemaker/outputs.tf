output "endpoint_name" {
  value = aws_sagemaker_endpoint.chatbot.name
}

output "endpoint_arn" {
  value = aws_sagemaker_endpoint.chatbot.arn
}

output "endpoint_url" {
  description = "Invoke URL (use AWS SDK with SageMaker Runtime)"
  value       = "https://runtime.sagemaker.${data.aws_region.current.name}.amazonaws.com/endpoints/${aws_sagemaker_endpoint.chatbot.name}/invocations"
}

output "execution_role_arn" {
  value = aws_iam_role.sagemaker_execution.arn
}
