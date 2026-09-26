import argparse
import importlib.util
import sys
from pathlib import Path
from sqlalchemy.dialects import postgresql
from sqlalchemy.schema import CreateTable

# python3 generate_sql.py ./core-service/src/db_connect/models.py -o schema.sql

def load_base_from_path(file_path: str, base_var_name: str = "Base"):
    path = Path(file_path).resolve()
    if not path.exists():
        raise FileNotFoundError(f"Nie znaleziono pliku: {path}")

    # Dodanie root i katalogu z plikiem do sys.path, aby importy wewnątrz modeli działały poprawnie
    sys.path.insert(0, str(Path.cwd()))
    sys.path.insert(0, str(path.parent))

    module_name = path.stem
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Nie można wczytać modułu z pliku: {path}")

    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)

    if not hasattr(module, base_var_name):
        raise AttributeError(
            f"W pliku '{path.name}' nie znaleziono obiektu o nazwie '{base_var_name}'."
        )

    return getattr(module, base_var_name)


def main():
    parser = argparse.ArgumentParser(
        description="Generuje DDL (CREATE TABLE) w dialekcie PostgreSQL z modeli SQLAlchemy."
    )
    parser.add_argument(
        "model_path",
        type=str,
        help="Ścieżka do pliku .py z modelami (np. app/models.py lub src/database/models.py)",
    )
    parser.add_argument(
        "--base-name",
        "-b",
        type=str,
        default="Base",
        help="Nazwa zmiennej reprezentującej Base (domyślnie: Base)",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default=None,
        help="Ścieżka do pliku wyjściowego (opcjonalnie, np. schema.sql). Domyślnie wypisuje w terminalu.",
    )

    args = parser.parse_args()

    try:
        base_obj = load_base_from_path(args.model_path, args.base_name)

        sql_statements = []
        for table in base_obj.metadata.sorted_tables:
            statement = CreateTable(table).compile(dialect=postgresql.dialect())
            sql_statements.append(f"{str(statement).strip()};\n")

        full_sql = "\n".join(sql_statements)

        if args.output:
            out_path = Path(args.output)
            out_path.write_text(full_sql, encoding="utf-8")
            print(f"✅ Wygenerowano SQL do pliku: {out_path.resolve()}")
        else:
            print(full_sql)

    except Exception as e:
        print(f"❌ Błąd: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()