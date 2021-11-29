cd /app/backup/json/
mongoexport --collection=issues --db=waptrunner --out=issues.json
mongoexport --collection=cwe --db=waptrunner --out=cwe.json
mongoexport --collection=testkb --db=waptrunner --out=testkb.json
mongoexport --collection=project --db=waptrunner --out=project.json