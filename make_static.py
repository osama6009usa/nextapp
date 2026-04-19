import re, base64, os

html = open('ui/biosovereignty-Team.html', encoding='utf-8').read()

# Remove base64 photos - replace with emoji SVG fallback
photo_pattern = r"'Dr__[^']+\.jpeg':\s*'data:image/jpeg;base64,[^']+'"
html = re.sub(photo_pattern, "'placeholder': 'none'", html)

# Remove PHOTO_DATA entirely - force SVG fallback always
html = html.replace(
    "PHOTO_DATA[s.photo]||s.photo",
    "'__NOPHOTO__'"
)

# Write as static file
with open('public/team-static.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Done - size: ' + str(len(html)))
