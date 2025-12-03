from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")

print("📌 Available Databases:")
for db_name in client.list_database_names():
    print("  -", db_name)

print("\n🔍 Checking collections...")
for db_name in client.list_database_names():
    db = client[db_name]
    print(f"\n📂 Collections in {db_name}:")
    for coll_name in db.list_collection_names():
        print("  -", coll_name)

        # print first product
        first = db[coll_name].find_one()
        if first:
            print("   → Sample Document:", first)
        else:
            print("   → (empty collection)")
