from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


def test_back_to_top_button_uses_high_contrast_theme_safe_styles():
    source = (REPO_ROOT / "src/components/BackToTop.jsx").read_text(encoding="utf-8")

    assert "bg-cyan-600" in source
    assert "hover:bg-cyan-500" in source
    assert "dark:bg-cyan-500" in source
    assert "dark:hover:bg-cyan-400" in source
    assert "focus-visible:ring-cyan-300" in source
