html = open('public/team-static.html', encoding='utf-8').read()

# Remove selectall from presets row
old_preset = """<div class="preset" onclick="selectPreset('selectall',this)">\u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0643\u0644</div>"""
new_preset = ""

if old_preset in html:
    html = html.replace(old_preset, new_preset)
    print('Removed from presets')

# Add select-all button above spec-sel-grid
old_grid = """<div class="spec-sel-grid" id="specSelGrid"></div>"""
new_grid = """<div style="display:flex;justify-content:space-between;margin-bottom:5px;">
              <span style="font-size:9px;color:var(--t3);" id="selCountLbl">0 \u0645\u062D\u062F\u062F\u064A\u0646</span>
              <span style="font-size:9px;color:var(--acc);cursor:pointer;font-weight:700;" onclick="selectPreset('selectall',this)">\u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0643\u0644</span>
            </div>
            <div class="spec-sel-grid" id="specSelGrid"></div>"""

if old_grid in html:
    html = html.replace(old_grid, new_grid)
    print('Added inside list')

open('public/team-static.html', 'w', encoding='utf-8').write(html)
print('Done')