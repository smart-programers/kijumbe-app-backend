import { RuleType } from "@prisma/client";
import db from "../../prisma/client";

export class Rule {
  public id: string;

  constructor(id?: string) {
    this.id = id as string;
  }

  async create(
    groupId: string,
    title: string,
    description: string,
    penaltyAmount: number,
    type: string,
    isActive: boolean,
  ) {
    const rule = await db.rule.create({
      data: {
        groupId: groupId,
        title: title,
        description: description,
        penaltyAmount: penaltyAmount,
        type: type as RuleType,
        isActive: isActive,
      },
    });

    return rule;
  }

  async edit(
    groupId: string,
    title: string,
    description: string,
    penaltyAmount: number,
    type: string,
    isActive: boolean,
  ) {
    const rule = await db.rule.update({
      where: {
        id: this.id,
        groupId: groupId,
      },
      data: {
        title: title,
        description: description,
        penaltyAmount: penaltyAmount,
        type: type as RuleType,
        isActive: isActive,
      },
    });

    return rule;
  }

  async delete() {
    const rule = await db.rule.delete({
      where: {
        id: this.id,
      },
    });

    return rule;
  }
}
