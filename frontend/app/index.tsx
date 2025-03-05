// app/index.tsx
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/home" />; // 重定向到 /home
}
