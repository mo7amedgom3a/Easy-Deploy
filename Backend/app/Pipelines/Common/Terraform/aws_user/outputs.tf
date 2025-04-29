

output "iam_role_arn" {
  value = aws_iam_role.user_role.arn
}


output "aws_access_key" {
  value = aws_iam_access_key.user_key.id
  sensitive = true
}

output "aws_secret_access_key" {
  value = aws_iam_access_key.user_key.secret
  sensitive = true
}

output "aws_account_id" {
  value = data.aws_caller_identity.current.account_id
}

