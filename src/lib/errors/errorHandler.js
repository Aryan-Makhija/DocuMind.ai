import { NextResponse } from "next/server";
import { AppError } from "./AppError";

export function handleApiError(error, context = "API") {
  console.error(`[${context}]`, error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details
            ? { details: error.details }
            : {}),
        },
      },
      {
        status: error.status,
      }
    );
  }

  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message:
          "Something went wrong. Please try again later.",
      },
    },
    {
      status: 500,
    }
  );
}