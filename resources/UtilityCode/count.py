import json
import argparse

def count_records(file_path):
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
            return len(data)
    except Exception as e:
        print(f"An error occurred: {e}")
        return 0

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Count the number of records in a JSON file.')
    parser.add_argument('file_path', type=str, help='The path to the JSON file.')
    args = parser.parse_args()

    record_count = count_records(args.file_path)
    print(f"Number of records in the JSON file: {record_count}")