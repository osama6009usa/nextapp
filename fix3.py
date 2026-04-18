lines = open('C:/nextapp/components/DailyScoreCard.tsx', encoding='utf-8').readlines()
new_lines = []
for l in lines:
    if 'linear-gradient(90deg,' in l and '#7C3AED' in l:
        l = "        <div style={{height:3,background:'linear-gradient(90deg,'+gc+',#7C3AED)'}}/>\n"
    new_lines.append(l)
open('C:/nextapp/components/DailyScoreCard.tsx', 'w', encoding='utf-8').writelines(new_lines)
print('fixed')
