import { JoinStatus, MemberRole, MembershipStatus } from "@prisma/client";
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
         status:"approved"
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
  
  async adminAdd(
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
    
    const admin = await db.member.findFirst({
      where:{
        id:creator,
        groupId:groupId,
        role:"admin",
        isRemoved:false,
        status:"approved"
      }
    })
    
    if(!admin){
       return { result:null,status:400,message:"Only Admin Can Add User to Group"}
    }
    const currentMemberCount = await db.member.count({
       where: {
         groupId: groupId,
         isRemoved: false, 
         status:"approved"
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
        status:"approved"
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
  
  async update(status:string){
    const member = await db.member.findFirst({
      where:{
        id:this.id
      }
    })
    
    if(!member){
     return { result:null,status:400,message:"Member Does not Exist"}  
    }
    
    const group = await db.group.findFirst({
      where:{
        id:member.groupId
      }
    })
    
    if(!group){
      return { result:null,status:400,message:"Group Not Found"}
    }
    const currentMemberCount = await db.member.count({
       where: {
         groupId: member.groupId,
         isRemoved: false, 
         status:"approved"
       },
     });
    
    if (currentMemberCount >= group.memberLimit) {
      return { result:null,status:400,message:"Group Limit Reached"}
    }
    
    const updatedMember = await db.member.update({
      where:{
        id:this.id,   
      },
      data:{
         status:status as MembershipStatus
      }
    })
    
     return { result: updatedMember, status: 200, message: `Member ${status} Successfully` };
  }

  async delete(userId:string) {
    
  
    
    const groupFromMember = await db.member.findFirst({
      where:{
        id:this.id
      }
    })
    
    if(!groupFromMember){
         return { result:null,status:400,message:"Member Does Not Exist"}
    }
    
    const group = await db.group.findFirst({
      where:{
        id:groupFromMember.id
      }
    })
    
    if(!group){
       return { result:null,status:400,message:"Group Does Not Exist"} 
    }
    
    const remover = await db.member.findFirst({
      where:{
        id:userId,
        groupId:group.id,
        role:"admin",
        isRemoved:false,
        status:"approved"
      }
    })
    
    if(!remover){
       return { result:null,status:400,message:"Only Admin can Remove User From Group"}
    }
    
    if(group.userId===this.id){
     return { result:null,status:400,message:"Cannot Remove Group Creator"}  
    }
    
    const member = await db.member.update({
      where: {
        id: this.id,
      },
      data:{
        isRemoved:true
      }
    });

    return { result: member, status: 200, message: "Removed Successfully" };
  }

  async left(userId:string,groupId:string) {

    const member = await db.member.findFirst({
      where:{
        userId:userId,
        groupId:groupId
      }
    })

    if(!member){
      return { result:null,status:400,message:"Member Does Not Exist"}
    }

    const group = await db.group.findFirst({
      where:{
        id:member.groupId
      }
    })

    if(!group){
      return { result:null,status:400,message:"Group Does Not Exist"}
    }


    const memberLeft = await db.member.update({
      where: {
        id: member.id,
      },
      data:{
        isRemoved:true
      }
    });

    return { result: memberLeft, status: 200, message: "Removed Successfully" };
  }
}
