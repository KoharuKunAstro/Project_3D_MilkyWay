import pandas as pd
import json
import os
import math

# --- Настройки ---
files = {
    "CO": "CO.xlsx",
    "H2O": "H2O.xlsx",
    "OH": "OH.xlsx",
    "HCO+": "HCO+.xlsx"
}

# Числовые колонки, в которых нужно заменить запятую на точку
NUMERIC_COLS = ["l", "b", "r", "v_r", "Intensity"]

# --- Чтение и первичная обработка ---
dataframes = []

for molecule, filename in files.items():
    if not os.path.exists(filename):
        print(f"Файл {filename} не найден, пропускаем.")
        continue

    df = pd.read_excel(filename, dtype=str)   # читаем всё как строки, чтобы безопасно менять запятые

    # --- Замена запятой на точку в числовых колонках ---
    for col in NUMERIC_COLS:
        if col in df.columns:
            # Заменяем запятую на точку и преобразуем в число (нечисловое -> NaN)
            df[col] = pd.to_numeric(df[col].str.replace(",", "."), errors="coerce")

    # Добавляем колонку Transition, если её нет
    if "Transition" not in df.columns:
        df["Transition"] = None

    df["Molecule"] = molecule
    dataframes.append(df)

# Объединяем все данные
all_data = pd.concat(dataframes, ignore_index=True)

# --- Группировка по Name ---
def aggregate_transitions(series, all_data_local):
    """
    Собираем словарь {молекула: [уникальные переходы]}
    series – значения Transition для одного объекта
    all_data_local – полный DataFrame (чтобы получить колонку Molecule по индексам)
    """
    transitions_dict = {}
    for mol in files.keys():
        mol_mask = all_data_local.loc[series.index, "Molecule"] == mol
        mol_transitions = series[mol_mask]
        clean = [str(v) for v in mol_transitions if pd.notnull(v) and str(v).strip() != ""]
        if clean:
            transitions_dict[mol] = sorted(set(clean))
    return transitions_dict if transitions_dict else None

# Используем вспомогательную функцию внутри groupby
merged = all_data.groupby("Name").agg(
    l=("l", "first"),
    b=("b", "first"),
    r=("r", "first"),
    v_r=("v_r", "first"),
    Transitions=("Transition", lambda s: aggregate_transitions(s, all_data))
).reset_index()

# --- Добавление интенсивностей по молекулам ---
for mol in files.keys():
    mol_data = all_data[all_data["Molecule"] == mol][["Name", "Intensity"]]
    merged = pd.merge(merged, mol_data, on="Name", how="left", suffixes=("", f"_{mol}"))
    merged.rename(columns={"Intensity": mol}, inplace=True)

# --- Финальная очистка: замена всех NaN/Inf/None ---
def replace_nan(obj):
    if isinstance(obj, dict):
        return {k: replace_nan(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [replace_nan(v) for v in obj]
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
    return obj

result = merged.to_dict(orient="records")
result = replace_nan(result)

# --- Сохранение JSON ---
with open("merged_objects.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("Готово! Результат сохранён в merged_objects.json")