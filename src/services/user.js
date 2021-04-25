const { hash, compare } = require("../helpers/bcrypt");
const { sign, verify } = require("../helpers/jwt");
const {
  query,
  escape,
  insertGetId,
  getConntection,
  escapeId,
} = require("../helpers/mysql");
const { sendSns } = require("../helpers/sns");
const {
  setString,
  generateRandomNumber,
  isExistArray,
} = require("../helpers/utils");
const message = require("../libs/message");
const moment = require("moment-timezone");

const isFieldExist = async ({ field, value }) => {
  const data = await query(
    `select userId from users join members on members.memberId = users.memberId where isDeleted = 0 and ${escapeId(
      field
    )}=${escape(value)}`,
    [],
    true
  );
  if (data) {
    return true;
  } else {
    return false;
  }
};

const getUserByToken = async (token) => {
  const verifyUser = verify(token);
  if (!verifyUser) {
    throw message.accessDenied;
  }

  let connection = null;
  try {
    connection = await getConntection();
    await connection.beginTransaction();

    const user = (
      await connection.query(
        `select u.*,m.createdAt
        from users u
        join members m on m.memberId = u.memberId
        where u.userId = ? and m.isDeleted = 0`,
        [verifyUser.userId]
      )
    )[0][0];
    if (!user) {
      throw "사용 불가능한 계정입니다.";
    }
    delete user.password;
    await connection.query(
      `update members set signedAt = now() where memberId  =?`,
      [user.memberId]
    );
    await connection.commit();
    await connection.release();
    return user;
  } catch (error) {
    if (connection) {
      await connection.rollback();
      await connection.release();
    }
    throw error;
  }
};

const socialSignIn = async ({ method, token, policy }) => {
  if (!method || !token) {
    throw "잘못된 접근입니다.";
  }
  const user = await query(
    `select m.createdAt, u.*
    from users u
    join members m on m.memberId=u.memberId
    where m.isDeleted = 0 and u.snsToken = ? and u.method = ?
    `,
    [token, method],
    true
  );
  if (user) {
    await query(`update members set signedAt = now() where memberId  =?`, [
      user.memberId,
    ]);
    return {
      token: sign({ userId: user.userId }),
      user,
    };
  } else {
    if (!policy) {
      throw { policy: true };
    }
    let connection = null;
    try {
      connection = await getConntection();
      await connection.beginTransaction();
      const memberId = await insertGetId(
        connection,
        'insert into members (type,createdAt) values("user",now())'
      );
      const userId = await insertGetId(
        connection,
        `insert into users(
          memberId,
          name,
          phone,
          email,
          method,
          snsToken
          )
        values(?,?,?,?,?,?)
        `,
        [memberId, "", "", "", method, token]
      );

      const [ud] = await connection.query(
        `
        select m.createdAt, u.*
        from users u
        join members m on m.memberId=u.memberId
        where u.userId  = ? 
        `,
        [userId]
      );
      const user = ud[0];
      if (!user) {
        throw "알 수 없는 오류입니다.";
      }
      await connection.commit();
      await connection.release();
      return {
        token: sign({ userId }),
        user,
        signup: true,
      };
    } catch (error) {
      if (connection) {
        await connection.rollback();
        await connection.release();
      }
      throw error;
    }
  }
};

const signIn = async ({ email, password }) => {
  const user = await query(
    `select m.createdAt, u.*
    from users u
    join members m on m.memberId=u.memberId
    where m.isDeleted = 0 and u.email = ?
    `,
    [email],
    true
  );
  if (!user) {
    throw { key: "email", message: "가입된 이메일이 아닙니다." };
  } else if (!compare(user.password, password)) {
    throw { key: "password", message: "비밀번호가 올바르지 않습니다" };
  } else {
    delete user.password;
    await query(`update members set signedAt = now() where memberId  =?`, [
      user.memberId,
    ]);

    return {
      token: sign({ userId: user.userId }),
      user,
    };
  }
};

const signUp = async ({ email, name, password, gender, phone, age }) => {
  if (await isFieldExist({ field: "phone", value: phone })) {
    throw "이미 가입된 휴대폰번호입니다.";
  } else if (await isFieldExist({ field: "email", value: email })) {
    throw { key: "email", message: "이미 가입된 이메일입니다." };
  }
  let connection = null;
  try {
    connection = await getConntection();
    await connection.beginTransaction();

    const memberId = await insertGetId(
      connection,
      'insert into members (type,createdAt) values("user",now())'
    );

    const userId = await insertGetId(
      connection,
      `insert into users(
          memberId,
          name,
          phone,
          password,
          email,
          gender,
          age
          )
        values(?,?,?,?,?,?,?)
        `,
      [
        memberId,
        name,
        phone,
        hash(password),
        email,
        gender || null,
        age || null,
      ]
    );

    const [ud] = await connection.query(
      `
      select m.createdAt, u.*
      from users u
      join members m on m.memberId=u.memberId
      where u.userId  = ? 
      `,
      [userId]
    );
    const user = ud[0];
    if (!user) {
      throw "알 수 없는 오류입니다.";
    }
    await connection.commit();
    await connection.release();
    return {
      token: sign({ userId }),
      user,
    };
  } catch (error) {
    if (connection) {
      await connection.rollback();
      await connection.release();
    }
    throw error;
  }
};

const put = async ({ columns, values, userId }) => {
  if (!isExistArray(columns) || !isExistArray(values) || !userId) {
    throw message.wrongInput;
  }

  if (columns.includes("password")) {
    const passwordIndex = columns.findIndex((x) => x === "password");
    values[passwordIndex] = hash(values[passwordIndex]);
  }

  await query(
    `update users set ${columns
      .map((key, index) => `${escapeId(key)}=${escape(values[index])}`)
      .join(",")} where userId=?`,
    [userId]
  );

  if (
    columns.includes("postCode") &&
    columns.includes("address") &&
    !(
      await query("select * from userAddress where address=? and userId=? ", [
        values[columns.findIndex((x) => x === "address")],
        userId,
      ])
    ).length
  ) {
    query(
      `insert into userAddress(userId,postCode,address,addressDetail) values(?,?,?,?)`,
      [
        userId,
        values[columns.findIndex((x) => x === "postCode")] || "",
        values[columns.findIndex((x) => x === "address")] || "",
        values[columns.findIndex((x) => x === "addressDetail")] || "",
      ]
    );
  }
  const response = {};
  columns.forEach((x, i) => {
    if (x === "password") {
      return;
    }
    response[x] = values[i];
  });

  return response;
};

const exitUser = async ({ userId }) => {
  if (!userId) {
    throw "올바르지 않은 요청입니다.";
  }
  const user = await query(
    "select u.userId,u.memberId from users u join members m on m.memberId=u.memberId where  u.userId=? and isDeleted =0",
    [userId],
    true
  );
  if (!user) {
    throw "삭제 불가능한 회원입니다.";
  }
  await query(
    "update members set isDeleted = 1,deletedAt=now() where memberId = ?",
    [user.memberId]
  );
};

const fetch = async ({ start, end, keyword, limit, page, method }) => {
  keyword = setString(keyword);
  const where = `
    where 
    m.isDeleted = 0
    ${start ? ` and m.createdAt >= ${escape(start + " 00:00:00")} ` : ""}
    ${end ? ` and m.createdAt <= ${escape(end + " 23:59:59")} ` : ""}
    ${
      keyword
        ? ` and
      (
        u.name like ${escape(`%${keyword}%`)}
        or
        u.phone like ${escape(`%${keyword}%`)}
        or
        u.email like ${escape(`%${keyword}%`)}
      )  `
        : ""
    }
  ${method ? ` and u.method = ${escape(method)}` : ""}
  `;
  const results = await query(`
    select 
    u.memberId,
    u.userId,
    m.createdAt,
    u.method,
    u.email,
    u.name,
    u.phone,
    concat(u.address, ' ', u.addressDetail ) as address,
    ${where} 
    ${
      page && limit
        ? ` limit ${limit} offset ${(parseInt(page) - 1) * parseInt(limit)} `
        : ""
    }
  `);

  const { totalCount } = await query(
    `
    select count(*) as totalCount
    from users u
    join members m on m.memberId=u.memberId
    ${where} 
    `,
    [],
    true
  );

  return {
    results,
    totalCount,
  };
};

const getUserInfo = async ({ userId }) => {
  const user = await query(
    `
  select
  m.isDeleted, 
  m.createdAt,
  u.name,
  u.gender,
  u.age,u.userId,m.memberId,
  u.phone,
  u.address,u.addressDetail,
  u.profilePath,
  u.email,
  from users u 
  join members m on m.memberId=u.memberId
  where  u.userId = ?
  `,
    [userId],
    true
  );

  return user;
};

const restore = async ({ userId }) => {
  const user = await query(
    "select * from users where userId = ?",
    [userId],
    true
  );

  if (user) {
    await query(
      "update members set deletedAt = null, isDeleted = 0 where memberId = ?",
      [user.memberId]
    );
  } else {
    throw "복구가능한 상태가 아닙니다.";
  }
};

const resetPasswordByPhone = async (phone) => {
  if (!phone) {
    throw "전화번호를 입력해주세요.";
  }
  const user = await query(
    `select userId 
      from users u
      join members m on m.memberId = u.memberId
      where phone = ?`,
    [phone],
    true
  );
  if (!user) {
    throw { noExist: true, message: "접근 권한이 없습니다." };
  }
  let connection = null;
  try {
    connection = await getConntection();
    await connection.beginTransaction();
    const randomDigit = generateRandomNumber(10).toString();
    await connection.query("update users set password = ? where userId = ?", [
      hash(randomDigit),
      user.userId,
    ]);
    await sendSns({
      phone,
      message: ``,
    });

    await connection.commit();
    await connection.release();
  } catch (error) {
    if (connection) {
      await connection.rollback();
      await connection.release();
    }
    throw error;
  }
};

module.exports = {
  put,
  resetPasswordByPhone,
  restore,
  fetch,
  exitUser,
  signUp,
  getUserInfo,
  signIn,
  getUserByToken,
  socialSignIn,
};
