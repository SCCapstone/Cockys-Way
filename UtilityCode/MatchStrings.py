import sys

def compare_strings(str1, str2):
    str1 = str1.strip().lower()
    str2 = str2.strip().lower()
    
    if str1 == str2:
        return "Strings match"
    else:
        inconsistencies = []
        highlighted_str1 = []
        highlighted_str2 = []
        
        for i in range(max(len(str1), len(str2))):
            char1 = str1[i] if i < len(str1) else "None"
            char2 = str2[i] if i < len(str2) else "None"
            if char1 != char2:
                inconsistencies.append(f"Position {i}: '{char1}' != '{char2}'")
                highlighted_str1.append(f"\033[91m{char1}\033[0m")  # Red color for mismatched characters
                highlighted_str2.append(f"\033[91m{char2}\033[0m")
            else:
                highlighted_str1.append(char1)
                highlighted_str2.append(char2)
        
        highlighted_str1 = ''.join(highlighted_str1)
        highlighted_str2 = ''.join(highlighted_str2)
        
        return "Strings do not match\n" + "\n".join(inconsistencies) + f"\n\n{highlighted_str1}\n{highlighted_str2}"

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python SHAverifier.py <string1> <string2>")
        sys.exit(1)

    string1 = sys.argv[1]
    string2 = sys.argv[2]

    result = compare_strings(string1, string2)
    print(result)