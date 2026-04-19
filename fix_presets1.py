html = open('public/team-static.html', encoding='utf-8').read()

# Fix preset labels - remove 2-5, rename All to general
old_labels_ar = "pr1:'\u0641\u0631\u062F\u064A',pr4:'\u0662\u2013\u0665',prAll:'\u0627\u0644\u0643\u0644'"
new_labels_ar = "pr1:'\u0641\u0631\u062F\u064A',pr4:'\u0641\u0631\u062F\u064A',prAll:'\u0639\u0627\u0645'"

old_labels_en = "pr1:'Solo',pr4:'2\u20135',prAll:'All'"
new_labels_en = "pr1:'Solo',pr4:'Solo',prAll:'General'"

if old_labels_ar in html:
    html = html.replace(old_labels_ar, new_labels_ar)
    print('Fixed AR labels')
if old_labels_en in html:
    html = html.replace(old_labels_en, new_labels_en)
    print('Fixed EN labels')

open('public/team-static.html', 'w', encoding='utf-8').write(html)
print('Done')