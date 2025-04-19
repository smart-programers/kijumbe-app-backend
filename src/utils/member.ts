import { JoinStatus, MemberRole } from "@prisma/client";
import db from "../../prisma/client";

export class Member {
  public id: string;

  constructor(id?: string) {
    this.id = id as string;
  }

  async create(
    groupId: string,
    role: string,
    joinStatus: string,
    userId: string,
    creator: string,
    isRemoved?: boolean,
  ) {
    const group = await db.group.findFirst({
      where:{
        id:groupId
      }
    })
    
    if(!group){
      return { result:null,status:400,message:"Group Not Found"}
    }
    const currentMemberCount = await db.member.count({
       where: {
         groupId: groupId,
         isRemoved: false, 
       },
     });
    
    if (currentMemberCount >= group.memberLimit) {
      return { result:null,status:400,message:"Group Limit Reached"}
    }
    const member = await db.member.create({
      data: {
        groupId: groupId,
        role: role as MemberRole,
        joinStatus: joinStatus as JoinStatus,
        isRemoved: isRemoved,
        userId: userId,
        entryUser: creator,
      },
    });

    return { result: member, status: 200, message: "Member Added Successfully" };
  }

  async edit(
    groupId: string,
    role: string,
    joinStatus: string,
    userId: string,
    creator: string,
    isRemoved?: boolean,
  ) {
    const member = await db.member.update({
      where: {
        id: this.id,
        entryUser: creator,
      },
      data: {
        groupId: groupId,
        role: role as MemberRole,
        joinStatus: joinStatus as JoinStatus,
        isRemoved: isRemoved,
        userId: userId,
      },
    });

    return member;
  }

  async delete() {
    const member = await db.member.delete({
      where: {
        id: this.id,
      },
    });

    return member;
  }
}
