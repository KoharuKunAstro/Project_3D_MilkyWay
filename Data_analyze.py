import pandas as pd
import json
import os

# Пути к файлам (лежат в одной папке со скриптом)
files = {
    "CO": "CO.xlsx",
    "H2O": "H2O.xlsx",
    "OH": "OH.xlsx",
    "HCO+": "HCO+.xlsx"
}

# Список для хранения DataFrame'ов
dataframes = []

# Чтение и разметка
for molecule, filename in files.items():
    if not os.path.exists(filename):
        print(f"Файл {filename} не найден, пропускаем.")
        continue
    df = pd.read_excel(filename)
    
    # Убедимся, что столбец интенсивности называется 'Intensity'
    # Если в реальности название другое, здесь можно переименовать
    df["Molecule"] = molecule
    dataframes.append(df)

# Объединение всех строк
all_data = pd.concat(dataframes, ignore_index=True)

# Группировка по Name:
# - Для координат (l,b,r,v_r) берём первое значение (предполагаем, что они одинаковы)
# - Для каждой молекулы создаём отдельный столбец с интенсивностью
#   Если молекула не измерена, значение будет NaN, потом заменим на None (null в JSON)
merged = all_data.groupby("Name").agg(
    l=("l", "first"),
    b=("b", "first"),
    r=("r", "first"),
    v_r=("v_r", "first"),
).reset_index()

# Добавляем столбцы с интенсивностями молекул
for mol in files.keys():
    # Берём данные только по этой молекуле
    mol_data = all_data[all_data["Molecule"] == mol][["Name", "Intensity"]]
    merged = pd.merge(merged, mol_data, on="Name", how="left", suffixes=("", f"_{mol}"))
    # Переименовываем столбец Intensity -> название молекулы
    merged.rename(columns={"Intensity": mol}, inplace=True)

# Заменяем NaN на None для корректного представления null в JSON
merged = merged.where(pd.notnull(merged), None)

# Преобразуем в список словарей
result = merged.to_dict(orient="records")

# Сохраняем в JSON с отступами
with open("merged_objects.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("Готово! Результат сохранён в merged_objects.json")