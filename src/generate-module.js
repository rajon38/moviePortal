/* global console, process */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODULES_DIR = path.join(__dirname, "app/module");
const ROUTES_INDEX = path.join(__dirname, "app/routes/index.ts");

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Convert camelCase or PascalCase module name to kebab-case route path
// e.g. "doctorSchedule" → "doctor-schedules", "appointment" → "appointments"
const toKebabPlural = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/s?$/, "s"); // naive pluralisation – adjust per module if needed
};

// ─── Route Registration ────────────────────────────────────────────────────────
const registerRoute = (moduleName) => {
  if (!fs.existsSync(ROUTES_INDEX)) {
    console.warn(`⚠️  Could not find routes index at: ${ROUTES_INDEX}`);
    console.warn("   Skipping auto route registration.");
    return;
  }

  const Cap = capitalize(moduleName);
  const routePath = toKebabPlural(moduleName);
  const exportName = `${Cap}Routes`;
  const importLine = `import { ${exportName} } from "../module/${moduleName}/${moduleName}.route";`;
  const useLine = `router.use("/${routePath}", ${exportName})`;

  let content = fs.readFileSync(ROUTES_INDEX, "utf-8");

  // Guard: skip if already registered
  if (content.includes(exportName)) {
    console.log(`ℹ️  Route for '${moduleName}' is already registered in index.ts — skipping.`);
    return;
  }

  // 1. Inject import after the last import line
  const lastImportIndex = content.lastIndexOf("\nimport ");
  const endOfLastImport = content.indexOf("\n", lastImportIndex + 1);
  content =
    content.slice(0, endOfLastImport + 1) +
    importLine +
    "\n" +
    content.slice(endOfLastImport + 1);

  // 2. Inject router.use() before the export line
  const exportLineIndex = content.indexOf("\nexport ");
  content =
    content.slice(0, exportLineIndex) +
    "\n" +
    useLine +
    content.slice(exportLineIndex);

  fs.writeFileSync(ROUTES_INDEX, content, "utf-8");
  console.log(`🔗 Registered route: router.use("/${routePath}", ${exportName})`);
};

// ─── File Templates ────────────────────────────────────────────────────────────
const generateModule = (moduleName) => {
  if (!moduleName) {
    console.error("Please provide a module name! Usage: node generateModule.js <moduleName>");
    process.exit(1);
  }

  const modulePath = path.join(MODULES_DIR, moduleName);

  if (fs.existsSync(modulePath)) {
    console.error(`Module '${moduleName}' already exists!`);
    process.exit(1);
  }

  fs.mkdirSync(modulePath, { recursive: true });

  const Cap = capitalize(moduleName);

  // ── interface ────────────────────────────────────────────────────────────────
  const interfaceFile = `
export interface ICreate${Cap}Payload {
  name: string;
  // TODO: add more fields
}

export interface IUpdate${Cap}Payload {
  name?: string;
  // TODO: add more fields
}
`.trimStart();

  // ── utils ────────────────────────────────────────────────────────────────────
  const utilsFile = `
import { isValid, parse } from "date-fns";

export const convertToDateTime = (dateString: string | undefined) => {
  if (!dateString) return undefined;
  const date = parse(dateString, "yyyy-MM-dd", new Date());
  if (!isValid(date)) return undefined;
  return date;
};
`.trimStart();

  // ── validation ───────────────────────────────────────────────────────────────
  const validationFile = `
import z from "zod";

const create${Cap}ZodSchema = z.object({
  name: z
    .string("Name must be a string")
    .min(1, "Name cannot be empty")
    .max(100, "Name must be less than 100 characters"),
  // TODO: add more fields
});

const update${Cap}ZodSchema = z.object({
  name: z
    .string("Name must be a string")
    .min(1, "Name cannot be empty")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  // TODO: add more fields
});

export const ${Cap}Validation = {
  create${Cap}ZodSchema,
  update${Cap}ZodSchema,
};
`.trimStart();

  // ── middleware ───────────────────────────────────────────────────────────────
  const middlewareFile = `
import { NextFunction, Request, Response } from "express";
import { IUpdate${Cap}Payload } from "./${moduleName}.interface.js";

export const update${Cap}Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data);
  }

  const payload: IUpdate${Cap}Payload = req.body;
  const files = req.files as { [fieldName: string]: Express.Multer.File[] | undefined };

  if (files?.profilePhoto?.[0]) {
    if (!payload) req.body = {};
    req.body.profilePhoto = files.profilePhoto[0].path;
  }

  req.body = payload;
  next();
};
`.trimStart();

  // ── service ──────────────────────────────────────────────────────────────────
  const serviceFile = `
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { prisma } from "../../lib/prisma.js";
import { ICreate${Cap}Payload, IUpdate${Cap}Payload } from "./${moduleName}.interface.js";

const getAll = async () => {
  const result = await prisma.${moduleName}.findMany();
  return result;
};

const getById = async (id: string) => {
  const result = await prisma.${moduleName}.findUniqueOrThrow({
    where: { id },
  });
  return result;
};

const create = async (user: IRequestUser, payload: ICreate${Cap}Payload) => {
  const result = await prisma.${moduleName}.create({
    data: { ...payload },
  });
  return result;
};

const updateById = async (
  user: IRequestUser,
  id: string,
  payload: IUpdate${Cap}Payload
) => {
  await prisma.${moduleName}.findUniqueOrThrow({ where: { id } });

  const result = await prisma.$transaction(async (tx) => {
    return await tx.${moduleName}.update({
      where: { id },
      data: { ...payload },
    });
  });

  return result;
};

const deleteById = async (id: string) => {
  const result = await prisma.$transaction(async (tx) => {
    return await tx.${moduleName}.delete({ where: { id } });
  });
  return result;
};

export const ${Cap}Service = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
`.trimStart();

  // ── controller ───────────────────────────────────────────────────────────────
  const controllerFile = `
import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { ${Cap}Service } from "./${moduleName}.service.js";

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await ${Cap}Service.getAll();
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "${Cap} list retrieved successfully",
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await ${Cap}Service.getById(req.params.id);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "${Cap} retrieved successfully",
    data: result,
  });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await ${Cap}Service.create(user, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.CREATED,
    message: "${Cap} created successfully",
    data: result,
  });
});

const updateById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await ${Cap}Service.updateById(user, req.params.id, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "${Cap} updated successfully",
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await ${Cap}Service.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "${Cap} deleted successfully",
    data: result,
  });
});

export const ${Cap}Controller = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
`.trimStart();

  // ── route ────────────────────────────────────────────────────────────────────
  const routeFile = `
import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { multerUpload } from "../../config/multer.config.js";
import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { ${Cap}Controller } from "./${moduleName}.controller.js";
import { update${Cap}Middleware } from "./${moduleName}.middleware.js";
import { ${Cap}Validation } from "./${moduleName}.validation.js";

const router = Router();

router.get("/", checkAuth(Role.ADMIN), ${Cap}Controller.getAll);

router.get("/:id", checkAuth(Role.ADMIN), ${Cap}Controller.getById);

router.post(
  "/",
  checkAuth(Role.ADMIN),
  validateRequest(${Cap}Validation.create${Cap}ZodSchema),
  ${Cap}Controller.create
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  multerUpload.fields([{ name: "profilePhoto", maxCount: 1 }]),
  update${Cap}Middleware,
  validateRequest(${Cap}Validation.update${Cap}ZodSchema),
  ${Cap}Controller.updateById
);

router.delete("/:id", checkAuth(Role.ADMIN), ${Cap}Controller.deleteById);

export const ${Cap}Routes = router;
`.trimStart();

  // ── Write files ──────────────────────────────────────────────────────────────
  const filesToCreate = {
    [`${moduleName}.interface.ts`]: interfaceFile,
    [`${moduleName}.utils.ts`]: utilsFile,
    [`${moduleName}.validation.ts`]: validationFile,
    [`${moduleName}.middleware.ts`]: middlewareFile,
    [`${moduleName}.service.ts`]: serviceFile,
    [`${moduleName}.controller.ts`]: controllerFile,
    [`${moduleName}.route.ts`]: routeFile,
  };

  for (const [fileName, content] of Object.entries(filesToCreate)) {
    const filePath = path.join(modulePath, fileName);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created: ${filePath}`);
  }

  console.log(`\n🎉 Module '${moduleName}' generated at ${modulePath}`);

  // ── Auto-register route ──────────────────────────────────────────────────────
  registerRoute(moduleName);
};

const [, , moduleName] = process.argv;
generateModule(moduleName);