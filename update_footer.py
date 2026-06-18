import os
import glob

socials_html = """
        <div class="footer-socials" style="display: flex; gap: 15px; margin-top: 20px;">
          <a href="#" style="color: var(--color-text-muted); transition: color 0.3s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--color-text-muted)'"><svg style="width: 20px; height: 20px; fill: currentColor;" viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m4.4 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7m0 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m5.3-3.3a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z"/></svg></a>
          <a href="#" style="color: var(--color-text-muted); transition: color 0.3s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--color-text-muted)'"><svg style="width: 20px; height: 20px; fill: currentColor;" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg></a>
          <a href="#" style="color: var(--color-text-muted); transition: color 0.3s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--color-text-muted)'"><svg style="width: 20px; height: 20px; fill: currentColor;" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
          <a href="#" style="color: var(--color-text-muted); transition: color 0.3s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--color-text-muted)'"><svg style="width: 20px; height: 20px; fill: currentColor;" viewBox="0 0 24 24"><path d="M21.582 6.186a2.6 2.6 0 0 0-1.83-1.83C18.138 3.92 12 3.92 12 3.92s-6.138 0-7.752.436a2.6 2.6 0 0 0-1.83 1.83C2 7.8 2 12 2 12s0 4.2.418 5.814a2.6 2.6 0 0 0 1.83 1.83C5.862 20.08 12 20.08 12 20.08s6.138 0 7.752-.436a2.6 2.6 0 0 0 1.83-1.83C22 16.2 22 12 22 12s0-4.2-.418-5.814zM9.998 15.428v-6.856L15.93 12z"/></svg></a>
        </div>
"""

for filepath in glob.glob("*.html"):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    target_str = '<p class="footer-col-desc">Next-generation premium racing destination with cinematic visualizers, dynamic telemetry, and realistic go-karting experiences.</p>'
    
    if target_str in content and 'footer-socials' not in content:
        new_content = content.replace(target_str, target_str + socials_html)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
