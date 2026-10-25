import pathlib, sys, unittest
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import validate
class T(unittest.TestCase):
    def test_clean(self): self.assertEqual(validate.check(), [])
if __name__ == "__main__": unittest.main()
