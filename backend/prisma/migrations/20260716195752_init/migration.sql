-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "autores" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "editorial" TEXT NOT NULL,
    "lengua" TEXT NOT NULL,
    "pais_edicion" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "fecha_compra" DATETIME NOT NULL,
    "caratula" TEXT,
    "notas" TEXT,
    "donde_comprado" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Person_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookPerson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookPerson_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookPerson_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Wish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "autores" TEXT,
    "isbn" TEXT,
    "lengua" TEXT,
    "pais_edicion" TEXT,
    "notas" TEXT,
    "prioridad" TEXT DEFAULT 'media',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Wish_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_handle_key" ON "User"("handle");

-- CreateIndex
CREATE INDEX "Book_userId_isbn_idx" ON "Book"("userId", "isbn");

-- CreateIndex
CREATE INDEX "Book_userId_titulo_idx" ON "Book"("userId", "titulo");

-- CreateIndex
CREATE UNIQUE INDEX "Book_userId_isbn_key" ON "Book"("userId", "isbn");

-- CreateIndex
CREATE UNIQUE INDEX "Person_userId_nombre_key" ON "Person"("userId", "nombre");

-- CreateIndex
CREATE INDEX "BookPerson_role_personId_idx" ON "BookPerson"("role", "personId");

-- CreateIndex
CREATE UNIQUE INDEX "BookPerson_bookId_personId_role_key" ON "BookPerson"("bookId", "personId", "role");

-- CreateIndex
CREATE INDEX "Wish_userId_isbn_idx" ON "Wish"("userId", "isbn");

-- CreateIndex
CREATE INDEX "Wish_userId_titulo_idx" ON "Wish"("userId", "titulo");
