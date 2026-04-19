import re, base64, os

html = open('ui/biosovereignty-Team.html', encoding='utf-8').read()
pattern = r"'(Dr__[^']+\.jpeg)':\s*'(data:image/jpeg;base64,[^']+)'"
photos = re.findall(pattern, html)

os.makedirs('public/avatars', exist_ok=True)

names = {
    'Dr__Peter_Attia.jpeg': 'peter-attia.jpg',
    'Dr__Eric_Cressey.jpeg': 'eric-cressey.jpg',
    'Dr__Mike_Israetel.jpeg': 'mike-israetel.jpg',
    'Dr__Kyle_Gillett.jpeg': 'kyle-gillett.jpg',
    'Dr__Casey_Means.jpeg': 'casey-means.jpg',
    'Dr__Paul_Saladino.jpeg': 'paul-saladino.jpg',
}

for fname, data in photos:
    out = names.get(fname)
    if out:
        b64 = data.split(',')[1]
        with open('public/avatars/' + out, 'wb') as f:
            f.write(base64.b64decode(b64))
        print('Saved: ' + out)

print('Done')
