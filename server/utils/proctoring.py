import sys
import os

def main():
    try:
        import tensorflow as tf
        print("TensorFlow imported successfully")
        # Simulate face detection (mock logic)
        webcam_stream = sys.argv[1] if len(sys.argv) > 1 else ''
        # In real use, decode and process webcam_stream
        # For now, always print 'ok' (no violation)
        print('ok')
    except ImportError as e:
        print(f"TensorFlow not available: {e}")
        # TensorFlow not available, mock violation
        print('violation')
    except Exception as e:
        print(f"Error in proctoring: {e}")
        # Fallback to mock violation
        print('violation')

if __name__ == "__main__":
    main() 