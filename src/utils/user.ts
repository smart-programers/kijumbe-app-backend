import db from "../../prisma/client";

export class User {
  public id: string;
  constructor(id?: string) {
    this.id = id as string;
  }

  async create(
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string,
    photoUrl: string | null,
  ) {
    let user;

    user = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (user) {
      return { result: {}, status: 400, message: "User Already Exist" };
    }

    user = await db.user.create({
      data: {
        email: email,
        firstName: firstName,
        lastName: lastName,
        photoUrl: photoUrl as string,
        phoneNumber: phoneNumber,
      },
      select: {
        email: true,
        photoUrl: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
      },
    });

    return { result: user, status: 200, message: "User Created Successfully" };
  }

  async createWithPassword(
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string,
    photoUrl: string | null,
    password: string,
  ) {
    let user;

    user = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (user) {
      return { result: {}, status: 400, message:"User Already Exist"};
    }

    const hashPassword = await Bun.password.hash(password);
    user = await db.user.create({
      data: {
        email: email,
        firstName: firstName,
        lastName: lastName,
        photoUrl: photoUrl as string,
        phoneNumber: phoneNumber,
        password: hashPassword,
      },
      select: {
        email: true,
        photoUrl: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
      },
    });

    return { result: user, status: 200, message: "User Created Successfully" };
  }
}
