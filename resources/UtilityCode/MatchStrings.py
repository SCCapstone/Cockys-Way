import sys

def compare_strings(str1, str2):
    stripped_str1 = str1.strip()
    stripped_str2 = str2.strip()
    lower_str1 = stripped_str1.lower()
    lower_str2 = stripped_str2.lower()
    
    case_matching = stripped_str1 == stripped_str2
    case_insensitive_matching = lower_str1 == lower_str2
    
    if case_insensitive_matching:
        match_result = "Strings match"
    else:
        match_result = "Strings do not match"
        inconsistencies = []
        highlighted_str1 = []
        highlighted_str2 = []
        
        for i in range(max(len(lower_str1), len(lower_str2))):
            char1 = lower_str1[i] if i < len(lower_str1) else "None"
            char2 = lower_str2[i] if i < len(lower_str2) else "None"
            if char1 != char2:
                inconsistencies.append(f"Position {i}: '{char1}' != '{char2}'")
                highlighted_str1.append(f"\033[91m{char1}\033[0m")  # Red color for mismatched characters
                highlighted_str2.append(f"\033[91m{char2}\033[0m")
            else:
                highlighted_str1.append(char1)
                highlighted_str2.append(char2)
        
        highlighted_str1 = ''.join(highlighted_str1)
        highlighted_str2 = ''.join(highlighted_str2)
        
        match_result += "\n" + "\n".join(inconsistencies) + f"\n\n{highlighted_str1}\n{highlighted_str2}"
    
    case_match_result = "Strings ARE case-matching" if case_matching else "Strings are NOT case-matching"
    
    return match_result, case_match_result

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python MatchStrings.py <string1> <string2>")
        sys.exit(1)

    string1 = sys.argv[1]
    string2 = sys.argv[2]

    match_result, case_match_result = compare_strings(string1, string2)
    print(case_match_result)
    print(match_result)