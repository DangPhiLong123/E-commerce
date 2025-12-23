import React from "react";
import { Outlet } from "react-router-dom";
import { Header, Navigation, TopHeader, Footer, Modal } from "../../components";

const Public = () => {
  return (
    <div className="w-full flex flex-col">
      <TopHeader></TopHeader>
      <Header></Header>
      <Navigation></Navigation>
      <div className="w-full max-w-[1220px] mx-auto">
        <Outlet></Outlet>
      </div>
      <Footer />
      <Modal />
    </div>
  );
};

export default Public;
