from python_terraform import Terraform

# Initialize Terraform wrapper
tf = Terraform(working_dir='.')
vars = {
    "user_github_id": "12345678",
}

# Run Terraform init
print("Initializing...")
return_code, stdout, stderr = tf.init(capture_output=False)

# Apply with vars (auto-approve)
print("Applying Terraform...")
return_code, stdout, stderr = tf.apply(skip_plan=True, var=vars, capture_output=False, auto_approve=True)

# Get output in JSON format
print("Getting output...")
output = tf.output(json=True)
print(output)  # This is a Python dict parsed from the JSON

# input option to destroy
destroy = input("Do you want to destroy the resources? (y/n): ")
if destroy.lower() == 'y':
    # Destroy resources
    print("Destroying resources...")
    return_code, stdout, stderr = tf.destroy(capture_output=False, auto_approve=True)
    print("Resources destroyed.")
else:
    print("Resources not destroyed.")