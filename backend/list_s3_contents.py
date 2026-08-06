import boto3
import os

from config import get_env_clean

key = get_env_clean('AWS_ACCESS_KEY_ID')
secret = get_env_clean('AWS_SECRET_ACCESS_KEY')
bucket = get_env_clean('AWS_S3_BUCKET_NAME', 'trimtimebucket')
region = get_env_clean('AWS_REGION', 'us-east-2')

s3 = boto3.client('s3', aws_access_key_id=key, aws_secret_access_key=secret, region_name=region)
res = s3.list_objects_v2(Bucket=bucket)
contents = res.get('Contents', [])

print("=== AWS S3 BUCKET DIRECTORY AUDIT ===")
print("Bucket Name:", bucket)
print("Total Objects Found:", len(contents))

folders = set()
for obj in contents:
    file_key = obj['Key']
    folder_path = os.path.dirname(file_key)
    if folder_path:
        folders.add(folder_path)
    print(f"Path: https://{bucket}.s3.{region}.amazonaws.com/{file_key} ({obj['Size']} bytes)")

print("\n--- Summary of Folders in S3 Bucket ---")
for f in sorted(list(folders)):
    print(f"Folder: {f}")
