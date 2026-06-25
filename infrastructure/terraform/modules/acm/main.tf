# =============================================================================
#  ACM Module — SSL/TLS Certificate
#  Uses DNS validation via Route53 (domain must be managed in Route53).
# =============================================================================

resource "aws_acm_certificate" "main" {
  domain_name               = var.domain_name
  subject_alternative_names = var.subject_alternative_names
  validation_method         = "DNS"

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-cert"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# ── DNS Validation Records (requires Route53 hosted zone) ─────────────────────
data "aws_route53_zone" "main" {
  count        = var.route53_zone_id != "" ? 1 : 0
  zone_id      = var.route53_zone_id
  private_zone = false
}

resource "aws_route53_record" "validation" {
  for_each = var.route53_zone_id != "" ? {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  type            = each.value.type
  zone_id         = var.route53_zone_id
  records         = [each.value.record]
  ttl             = 60
}

resource "aws_acm_certificate_validation" "main" {
  count                   = var.route53_zone_id != "" ? 1 : 0
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.validation : record.fqdn]
}
