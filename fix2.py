lines = open('C:/nextapp/components/DailyScoreCard.tsx', encoding='utf-8').readlines()
new_lines = []
for l in lines:
    if "label:'🥩 البروتين'" in l:
        l = "    { label:'🥩 البروتين', score:breakdown.protein.score,  max:20, extra:Math.round(breakdown.protein.raw)+'g/'+breakdown.protein.goal+'g' },\n"
    elif "label:'💧 الماء'" in l:
        l = "    { label:'💧 الماء',    score:breakdown.water.score,    max:20, extra:breakdown.water.raw+'/'+breakdown.water.goal+'ml' },\n"
    elif "label:'🌙 الصيام'" in l:
        l = "    { label:'🌙 الصيام',  score:breakdown.fasting.score,  max:20, extra:breakdown.fasting.completed?'مكتمل':breakdown.fasting.hours>0?breakdown.fasting.hours+'h':'لم يبدأ' },\n"
    new_lines.append(l)
open('C:/nextapp/components/DailyScoreCard.tsx', 'w', encoding='utf-8').writelines(new_lines)
print('fixed')
