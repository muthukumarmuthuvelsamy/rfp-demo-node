const { z } = require("zod");

function createZodObject(shape = {}) {
  return z.object(shape);
}

function stringField(description, required = false) {
  let schema = z.string().describe(description || "string");
  if (!required) {
    schema = schema.optional();
  }
  return schema;
}

function booleanField(description, required = false) {
  let schema = z.boolean().describe(description || "boolean");
  if (!required) {
    schema = schema.optional();
  }
  return schema;
}

function numberField(description, required = false) {
  let schema = z.number().describe(description || "number");
  if (!required) {
    schema = schema.optional();
  }
  return schema;
}

function arrayField(description, required = false) {
  let schema = z.array(z.any()).describe(description || "array");
  if (!required) {
    schema = schema.optional();
  }
  return schema;
}

function objectField(description, required = false) {
  let schema = z.record(z.any()).describe(description || "object");
  if (!required) {
    schema = schema.optional();
  }
  return schema;
}

function fileField(description, required = false) {
  let schema = z.object({
    originalname: z.string().describe("Original uploaded filename"),
    mimetype: z.string().optional().describe("Uploaded file MIME type"),
    bufferBase64: z.string().describe("Base64 encoded file contents")
  }).describe(description || "uploaded file");
  if (!required) {
    schema = schema.optional();
  }
  return schema;
}

function inferFieldSchema(field = {}) {
  const {
    type = "string",
    description,
    required = false
  } = field;

  switch (type) {
    case "boolean":
      return booleanField(description, required);
    case "number":
      return numberField(description, required);
    case "array":
      return arrayField(description, required);
    case "object":
      return objectField(description, required);
    case "file":
      return fileField(description, required);
    case "string":
    default:
      return stringField(description, required);
  }
}

function buildInputSchema(route) {
  const bodyFields = route.mcp?.input?.body || {};
  const queryFields = route.mcp?.input?.query || {};
  const paramsFields = route.mcp?.input?.params || {};

  return createZodObject({
    body: createZodObject(buildShape(bodyFields)).optional(),
    query: createZodObject(buildShape(queryFields)).optional(),
    params: createZodObject(buildShape(paramsFields)).optional()
  });
}

function buildOutputSchema(route) {
  const outputFields = route.mcp?.output || {};

  return createZodObject(buildShape(outputFields));
}

function buildShape(fields = {}) {
  return Object.entries(fields).reduce((shape, [key, config]) => {
    shape[key] = inferFieldSchema(config);
    return shape;
  }, {});
}

function toJsonSchemaLike(zodSchema) {
  return zodToSchema(zodSchema);
}

function zodToSchema(zodSchema) {
  if (!zodSchema || !zodSchema._def) {
    return { type: "unknown" };
  }

  const unwrapped = unwrapSchema(zodSchema);
  const definition = unwrapped._def || {};
  const typeName = definition.typeName;
  const description = getSchemaDescription(unwrapped);

  switch (typeName) {
    case "ZodString":
      return buildLeafSchema("string", description, zodSchema);
    case "ZodNumber":
      return buildLeafSchema("number", description, zodSchema);
    case "ZodBoolean":
      return buildLeafSchema("boolean", description, zodSchema);
    case "ZodArray":
      return {
        type: "array",
        description,
        items: zodToSchema(definition.type)
      };
    case "ZodRecord":
      return {
        type: "object",
        description,
        additionalProperties: true
      };
    case "ZodObject":
      return objectShapeToSchema(unwrapped);
    default:
      return {
        type: normalizeTypeName(typeName),
        description
      };
  }
}

function objectShapeToSchema(zodObjectSchema) {
  const shape = zodObjectSchema.shape;
  const schema = {};

  for (const [key, childSchema] of Object.entries(shape)) {
    schema[key] = zodToSchemaWithRequired(childSchema);
  }

  return schema;
}

function zodToSchemaWithRequired(zodSchema) {
  const required = !isOptionalSchema(zodSchema);
  const baseSchema = zodToSchema(zodSchema);

  return {
    ...baseSchema,
    required
  };
}

function unwrapSchema(zodSchema) {
  if (zodSchema?._def?.typeName === "ZodOptional" || zodSchema?._def?.typeName === "ZodNullable") {
    return unwrapSchema(zodSchema._def.innerType);
  }

  return zodSchema;
}

function isOptionalSchema(zodSchema) {
  return zodSchema?._def?.typeName === "ZodOptional";
}

function getSchemaDescription(zodSchema) {
  return zodSchema?.description || zodSchema?._def?.description || "";
}

function buildLeafSchema(type, description, originalSchema) {
  return {
    type,
    description,
    required: !isOptionalSchema(originalSchema)
  };
}

function normalizeTypeName(typeName) {
  if (!typeName) {
    return "unknown";
  }

  return typeName.replace(/^Zod/, "").toLowerCase();
}

module.exports = {
  z,
  buildInputSchema,
  buildOutputSchema,
  toJsonSchemaLike,
  zodToSchema
};

// Made with Bob
