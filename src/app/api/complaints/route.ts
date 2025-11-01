import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { CreateComplaintDto } from "@/server/dto/complaints";

export async function GET(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { searchParams } = new URL(request.url);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const mine = searchParams.get("mine") === "1";
    const companyId = searchParams.get("companyId");

    let complaints;

    if (mine) {
      complaints = await ComplaintsRepo.findByUser(user.id);
    } else if (companyId) {
      complaints = await ComplaintsRepo.findByCompany(companyId);
    } else {
      complaints = await ComplaintsRepo.findPublic();
    }

    return NextResponse.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CreateComplaintDto.parse(body);

    const complaint = await ComplaintsRepo.create(validatedData, user.id);

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error("Error creating complaint:", error);

    if (error instanceof Error && "issues" in error) {
      const zodError = error as { issues: unknown[] };
      return NextResponse.json(
        { error: "Validation error", details: zodError.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

