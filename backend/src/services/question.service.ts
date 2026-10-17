import { prisma } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";
import type {
  CreateQuestionInput,
  ListQuestionsQuery,
  UpdateQuestionInput,
} from "../Schema/question.schema.js";

export async function createQuestion(data: CreateQuestionInput) {
  const existing = await prisma.question.findUnique({
    where: { slug: data.slug },
  });

  if (existing) {
    throw new AppError(`Slug "${data.slug}" already exists`, 409);
  }

  const payload: Record<string, any> = {
    title: data.title,
    slug: data.slug,
    description: data.description,
    difficulty: data.difficulty,
    tags: data.tags ?? [],
    companies: data.companies ?? [],
  };

  if (data.constraints !== undefined) payload.constraints = data.constraints;
  if (data.playlistId !== undefined) payload.playlistId = data.playlistId;
  if (data.orderIndex !== undefined) payload.orderIndex = data.orderIndex;

  return prisma.question.create({
    data: {
      ...payload,
      testCases: {
        create: data.testCases.map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample ?? false,
          isHidden: tc.isHidden ?? true,
        })),
      },
    } as any,
    include: { testCases: true },
  });
}

export async function listQuestions(query: ListQuestionsQuery) {
  const where: Record<string, unknown> = {
    ...(query.difficulty && { difficulty: query.difficulty }),
    ...(query.playlistId && { playlistId: query.playlistId }),
    ...(query.tag && { tags: { has: query.tag } }),
  };

  const [items, total] = await Promise.all([
    prisma.question.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        tags: true,
        companies: true,
        createdAt: true,
      },
    }),
    prisma.question.count({ where }),
  ]);

  return { items, total, page: query.page, limit: query.limit };
}

export async function getQuestionBySlug(slug: string) {
  const question = await prisma.question.findUnique({
    where: { slug },
    include: {
      testCases: {
        where: { isHidden: false },
      },
    },
  });

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  return question;
}

export async function getQuestionById(id: string) {
  const question = await prisma.question.findUnique({ where: { id } });

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  return question;
}

export async function updateQuestion(id: string, data: UpdateQuestionInput) {
  await getQuestionById(id);

  if (data.slug) {
    const clash = await prisma.question.findFirst({
      where: { slug: data.slug, NOT: { id } },
    });

    if (clash) {
      throw new AppError(`Slug "${data.slug}" already exists`, 409);
    }
  }

  const { testCases, ...rest } = data;
  const updateData: Record<string, any> = {};

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined) updateData[key] = value;
  });

  return prisma.$transaction(async (tx) => {
    if (testCases) {
      await tx.testCase.deleteMany({ where: { questionId: id } });
      await tx.testCase.createMany({
        data: testCases.map((tc) => ({
          questionId: id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample ?? false,
          isHidden: tc.isHidden ?? true,
        })),
      });
    }

    return tx.question.update({
      where: { id },
      data: updateData,
      include: { testCases: true },
    });
  });
}

export async function deleteQuestion(id: string) {
  await getQuestionById(id);

  const inUse = await prisma.interview.findFirst({ where: { questionId: id } });

  if (inUse) {
    throw new AppError(
      "Cannot delete a question that has interviews attached; archive it instead",
      409
    );
  }

  await prisma.question.delete({ where: { id } });
  return { id };
}
