lines = open('C:/nextapp/components/DailyScoreCard.tsx', encoding='utf-8').readlines()
new_lines = []
for l in lines:
    if "linear-gradient(90deg,'+gc+'" in l:
        l = "        <div style={{height:3,background:gc===\'#22C55E\'?\'linear-gradient(90deg,#22C55E,#7C3AED)\':gc===\'#4F46E5\'?\'linear-gradient(90deg,#4F46E5,#7C3AED)\':gc===\'#F59E0B\'?\'linear-gradient(90deg,#F59E0B,#7C3AED)\':\'linear-gradient(90deg,#EF4444,#7C3AED)}}/>\n"
    new_lines.append(l)
open('C:/nextapp/components/DailyScoreCard.tsx', 'w', encoding='utf-8').writelines(new_lines)
print('fixed')
