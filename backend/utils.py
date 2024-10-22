import os

def get_env_variable(var_name):
    """環境変数を取得する関数"""
    try:
        return os.environ[var_name]
    except KeyError:
        error_msg = f"必要な環境変数 {var_name} が設定されていません。"
        raise EnvironmentError(error_msg)

def sanitize_input(input_string):
    """ユーザー入力をサニタイズする関数"""
    # 簡単な例として、特殊文字を削除
    return ''.join(char for char in input_string if char.isalnum() or char.isspace())