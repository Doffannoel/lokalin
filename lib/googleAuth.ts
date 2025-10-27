// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import dbConnect from "@/lib/dbConnect";
// import User from "@/models/Users";

// const handler = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   callbacks: {
//     async signIn({ profile }) {
//       await dbConnect();
//       const existingUser = await User.findOne({ email: profile?.email });
//       if (!existingUser) {
//         await User.create({
//           username: profile?.name,
//           email: profile?.email,
//           image: profile?.image,
//           googleId: profile?.sub,
//         });
//       }
//       return true;
//     },
//     async session({ session, token }) {
//       if (!session.user) {
//         session.user = {} as any;
//       }
//       session.user.id = token.sub;
//       return session;
//     },
//   },
// });

// export { handler as GET, handler as POST };
