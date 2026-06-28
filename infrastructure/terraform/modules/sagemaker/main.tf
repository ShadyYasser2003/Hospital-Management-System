# =============================================================================
#  SageMaker Module — HakimAI Arabic Medical Chatbot
#  Uses Hugging Face Deep Learning Container (no custom build needed)
#  Model: Shams03/tawkeed-egy-medical-4b (auto-downloaded at startup)
# =============================================================================

# ── IAM Role ─────────────────────────────────────────────────────────────────
resource "aws_iam_role" "sagemaker_execution" {
  name = "${var.project_name}-${var.environment}-sagemaker-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "sagemaker.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "sagemaker_full" {
  role       = aws_iam_role.sagemaker_execution.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"
}

resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.sagemaker_execution.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# ── SageMaker Model (HuggingFace TGI Container) ─────────────────────────────
resource "aws_sagemaker_model" "chatbot" {
  name               = "${var.project_name}-${var.environment}-chatbot"
  execution_role_arn = aws_iam_role.sagemaker_execution.arn

  primary_container {
    # Official HuggingFace Text Generation Inference container
    # See: https://github.com/aws/deep-learning-containers/blob/master/available_images.md
    image = "763104351884.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/huggingface-pytorch-tgi-inference:2.3.1-tgi2.3.1-gpu-py311-cu121-ubuntu22.04-v2.0"

    environment = {
      HF_MODEL_ID             = var.model_id
      HF_TASK                 = "text-generation"
      SM_NUM_GPUS             = "1"
      MAX_INPUT_LENGTH        = "1024"
      MAX_TOTAL_TOKENS        = "2048"
      MAX_BATCH_TOTAL_TOKENS  = "4096"
    }
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-chatbot-model"
  })
}

# ── Endpoint Configuration ───────────────────────────────────────────────────
resource "aws_sagemaker_endpoint_configuration" "chatbot" {
  name = "${var.project_name}-${var.environment}-chatbot-config"

  production_variants {
    variant_name           = "primary"
    model_name             = aws_sagemaker_model.chatbot.name
    instance_type          = var.instance_type
    initial_instance_count = var.instance_count
    container_startup_health_check_timeout_in_seconds = 900
    model_data_download_timeout_in_seconds            = 900
  }

  tags = var.tags
}

# ── Endpoint ─────────────────────────────────────────────────────────────────
resource "aws_sagemaker_endpoint" "chatbot" {
  name                 = "${var.project_name}-${var.environment}-chatbot"
  endpoint_config_name = aws_sagemaker_endpoint_configuration.chatbot.name

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-chatbot-endpoint"
  })
}

data "aws_region" "current" {}
