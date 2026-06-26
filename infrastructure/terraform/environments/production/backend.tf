# =============================================================================
#  Terraform Backend — Local state for initial deployment
#  Migrate to S3 backend after infrastructure is stable.
# =============================================================================

# Using local state for bootstrapping. Once stable, uncomment below:
# terraform {
#   backend "s3" {
#     bucket         = "hms-terraform-state-529088275461"
#     key            = "production/terraform.tfstate"
#     region         = "us-east-1"
#     encrypt        = true
#     dynamodb_table = "hms-terraform-locks"
#   }
# }
