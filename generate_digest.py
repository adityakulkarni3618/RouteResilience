import os

EXCLUDE_DIRS = {
    'node_modules', 'venv', '.git', '.vscode', 'build', 'dist', 
    '__pycache__', '.venv', 'env', 'output'
}

EXCLUDE_FILES = {
    'digest.txt', 'package-lock.json', '.DS_Store', 'Thumbs.db'
}

TEXT_EXTENSIONS = {
    '.py', '.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.html', '.md', '.yml', '.yaml', '.txt'
}

def build_tree(path, prefix=""):
    try:
        entries = sorted(os.listdir(path))
    except Exception:
        return ""
    
    entries = [e for e in entries if e not in EXCLUDE_DIRS and e not in EXCLUDE_FILES]
    tree_str = ""
    for idx, name in enumerate(entries):
        full_path = os.path.join(path, name)
        is_last = (idx == len(entries) - 1)
        connector = "└── " if is_last else "├── "
        tree_str += f"{prefix}{connector}{name}\n"
        if os.path.isdir(full_path):
            next_prefix = prefix + ("    " if is_last else "│   ")
            tree_str += build_tree(full_path, next_prefix)
    return tree_str

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(root_dir, 'digest.txt')
    
    digest_content = []
    
    # 1. Directory Structure
    digest_content.append("================================================================================")
    digest_content.append("DIRECTORY STRUCTURE:")
    digest_content.append("================================================================================")
    digest_content.append(f"{os.path.basename(root_dir)}/")
    digest_content.append(build_tree(root_dir, "  "))
    digest_content.append("\n")
    
    # 2. File Contents
    for root, dirs, files in os.walk(root_dir):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in sorted(files):
            if file in EXCLUDE_FILES:
                continue
                
            _, ext = os.path.splitext(file)
            if ext.lower() not in TEXT_EXTENSIONS:
                continue
                
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, root_dir)
            
            digest_content.append("================================================================================")
            digest_content.append(f"File: {rel_path}")
            digest_content.append("================================================================================")
            
            try:
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                digest_content.append(content)
            except Exception as e:
                digest_content.append(f"[Error reading file: {e}]")
            digest_content.append("\n")
            
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("\n".join(digest_content))
    print(f"Digest generated successfully at: {output_file}")

if __name__ == "__main__":
    main()
