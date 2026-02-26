'use client';
import {getSessionUser} from "@/hooks/useUser";
import Loading from "@/app/loading";
import NotLoggedIn from "@/components/icon/NotLogined";

export default function TodoCard() {
    const {user, loading} = getSessionUser();

    if(loading) return <Loading></Loading>;

    if(!user) return <NotLoggedIn/>;


  return (
    <div>
      <h1>Todo List</h1>


    </div>
  );
}
