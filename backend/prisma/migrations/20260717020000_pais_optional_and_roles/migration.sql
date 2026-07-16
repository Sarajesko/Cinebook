-- Language roles: director_fotografia, banda_sonora (SQLite TEXT enum — client-side)
-- Make Book.pais_edicion optional
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "autores" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "editorial" TEXT NOT NULL,
    "lengua" TEXT NOT NULL,
    "pais_edicion" TEXT,
    "isbn" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "fecha_compra" DATETIME NOT NULL,
    "condicion" TEXT NOT NULL,
    "precio" REAL,
    "moneda" TEXT,
    "puntuacion" INTEGER,
    "caratula" TEXT,
    "notas" TEXT,
    "donde_comprado" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("anio", "autores", "caratula", "condicion", "createdAt", "donde_comprado", "editorial", "estado", "fecha_compra", "id", "isbn", "lengua", "moneda", "notas", "pais_edicion", "precio", "puntuacion", "titulo", "updatedAt", "userId") SELECT "anio", "autores", "caratula", "condicion", "createdAt", "donde_comprado", "editorial", "estado", "fecha_compra", "id", "isbn", "lengua", "moneda", "notas", "pais_edicion", "precio", "puntuacion", "titulo", "updatedAt", "userId" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE INDEX "Book_userId_isbn_idx" ON "Book"("userId", "isbn");
CREATE INDEX "Book_userId_titulo_idx" ON "Book"("userId", "titulo");
CREATE UNIQUE INDEX "Book_userId_isbn_key" ON "Book"("userId", "isbn");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
