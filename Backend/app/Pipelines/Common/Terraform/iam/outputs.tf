
output "iam_role_arn" {
  value = aws_iam_role.user_role.arn
}
output "aws_access_key" {
  value = aws_iam_access_key.user_key.id
  sensitive = true
}
output "user_group_name" {
  value = aws_iam_group.user_group.name
}
output "aws_secret_access_key" {
  value = aws_iam_access_key.user_key.secret
  sensitive = true
}
