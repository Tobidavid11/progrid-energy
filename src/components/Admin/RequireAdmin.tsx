import { useEffect, useState} from "react";
import type {ReactNode} from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import AdminLogin from "./AdminLogin";
import "./RequireAdmin.css";

interface RequireAdminProps {
  children: ReactNode;
}

type AuthState =
  | { status: "checking" }
  | { status: "signed-out" }
  | { status: "not-admin" }
  | { status: "admin" };

export default function RequireAdmin({ children }: RequireAdminProps) {
  const [state, setState] = useState<AuthState>({ status: "checking" });

  const checkAdminStatus = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setState({ status: "signed-out" });
      return;
    }

    // is_admin() is a Postgres function (see schema.sql) that checks the
    // admin_users table server-side — this can't be spoofed by editing
    // client-side state, since RLS enforces the same check independently
    // on every actual read/write to products and orders.
    const { data: isAdmin, error } = await supabase.rpc("is_admin");

    if (error || !isAdmin) {
      setState({ status: "not-admin" });
      return;
    }

    setState({ status: "admin" });
  };

  useEffect(() => {
    checkAdminStatus();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange fires automatically and re-runs checkAdminStatus.
  };

  if (state.status === "checking") {
    return (
      <div className="require-admin__loading">
        <Loader2 size={20} className="require-admin__spin" />
        Checking access...
      </div>
    );
  }

  if (state.status === "signed-out") {
    return <AdminLogin onSuccess={checkAdminStatus} />;
  }

  if (state.status === "not-admin") {
    return (
      <div className="require-admin__denied">
        <h2>Not Authorized</h2>
        <p>
          Your account is signed in but isn't registered as an admin for
          Progrid Energy. Contact whoever manages the technical to be
          added.
        </p>
        <button type="button" className="btn btn-ghost" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    );
  }

  return <>{children}</>;
}