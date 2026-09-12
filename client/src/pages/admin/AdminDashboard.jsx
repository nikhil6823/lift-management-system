import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  UsersRound,
} from "lucide-react";
import { getEmployees } from "../../services/employeeService";
import { getExpenses } from "../../services/expenseService";
import { getLifts } from "../../services/liftService";
import { getServiceRequests } from "../../services/serviceRequestService";
import { LiftCard } from "../../components/lifts/LiftCard";
import { ServiceRequestCard } from "../../components/service/ServiceRequestCard";
import { Loader } from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [state, setState] = useState({
    loading: true,
    error: "",
    lifts: [],
    jobs: [],
    employees: [],
    expenses: [],
  });
  useEffect(() => {
    Promise.all([
      getLifts(),
      getServiceRequests(),
      getEmployees(),
      getExpenses({ status: "pending" }),
    ])
      .then(([lifts, jobs, employees, expenses]) =>
        setState({
          loading: false,
          error: "",
          lifts,
          jobs,
          employees,
          expenses,
        }),
      )
      .catch((error) =>
        setState((current) => ({
          ...current,
          loading: false,
          error: error.message,
        })),
      );
  }, []);
  if (state.loading) return <Loader label="Loading operations" />;
  const operational = state.lifts.filter(
    (item) => item.status === "operational",
  ).length;
  const openJobs = state.jobs.filter(
    (item) => !["resolved", "closed"].includes(item.status),
  ).length;
  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Command center</span>
          <h1>Hello, {user?.name?.split(" ")[0]}.</h1>
          <p>Here’s the current shape of your lift network.</p>
        </div>
      </div>
      {state.error && <div className="alert error">{state.error}</div>}
      <div className="stats-grid">
        <div className="stat-card teal">
          <CheckCircle2 />
          <div>
            <span>Operational lifts</span>
            <strong>
              {operational}
              <small> / {state.lifts.length}</small>
            </strong>
          </div>
        </div>
        <div className="stat-card orange">
          <ClipboardList />
          <div>
            <span>Active service jobs</span>
            <strong>{openJobs}</strong>
          </div>
        </div>
        <div className="stat-card purple">
          <UsersRound />
          <div>
            <span>Field technicians</span>
            <strong>{state.employees.length}</strong>
          </div>
        </div>
        <div className="stat-card red">
          <AlertTriangle />
          <div>
            <span>Expenses awaiting review</span>
            <strong>{state.expenses.length}</strong>
          </div>
        </div>
      </div>
      <div className="split-section dashboard-sections">
        <section className="dashboard-section">
          <div className="section-title">
            <h2>Lift status</h2>
            <span>{state.lifts.length} assets</span>
          </div>
          <div className="card-grid">
            {state.lifts.slice(0, 3).map((lift) => (
              <LiftCard key={lift._id} lift={lift} />
            ))}
          </div>
        </section>
        <section className="dashboard-section">
          <div className="section-title">
            <h2>Priority work</h2>
            <span>{openJobs} open</span>
          </div>
          <div className="stack">
            {state.jobs
              .filter((job) => !["resolved", "closed"].includes(job.status))
              .slice(0, 3)
              .map((job) => (
                <ServiceRequestCard key={job._id} request={job} />
              ))}
            {!openJobs && <p className="empty-state">Everything is clear.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
