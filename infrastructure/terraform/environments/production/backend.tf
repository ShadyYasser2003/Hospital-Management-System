# =============================================================================
#  Terraform Remote State Backend
#  Store state in S3 with DynamoDB locking for team collaboration.
#
#  PREREQUISITES (create manually once, before first `terraform init`):
#    1. S3 bucket: hms-terraform-state-<account-id>
#    2. DynamoDB table: hms-terraform-locks (partition key: LockID)
# =============================================================================

terraform {
  backend "s3" {
    bucket         = "hms-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "hms-terraform-locks"
  }
}
