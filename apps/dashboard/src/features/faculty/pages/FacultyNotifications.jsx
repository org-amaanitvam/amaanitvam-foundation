import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';

export default function FacultyNotifications() {
  return (
    <div className="min-h-full bg-[#faf7f8] p-5 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="mb-7">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5e6ec] text-[#8a164b]">
            <Bell className="h-5 w-5" />
          </div>

          <div>
            <h1 className="font-heading text-3xl font-bold text-[#5d0f2d]">
              Notifications Center
            </h1>

            <p className="mt-1 text-sm text-[#756b70]">
              System alerts, student doubt notifications, and assignment updates.
            </p>
          </div>

        </div>

      </div>


      {/* Notification Summary */}
      <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-3">

        <div className="rounded-[20px] border border-[#eadfe4] border-t-4 border-t-[#8a164b] bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#756b70]">
                All Notifications
              </p>

              <h2 className="mt-2 font-heading text-3xl font-bold text-[#5d0f2d]">
                12
              </h2>
            </div>

            <div className="rounded-xl bg-[#f5e6ec] p-3 text-[#8a164b]">
              <Bell className="h-5 w-5" />
            </div>

          </div>

        </div>


        <div className="rounded-[20px] border border-[#eadfe4] border-t-4 border-t-[#d8a15f] bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#756b70]">
                Unread
              </p>

              <h2 className="mt-2 font-heading text-3xl font-bold text-[#5d0f2d]">
                5
              </h2>
            </div>

            <div className="rounded-xl bg-[#f4e3c1] p-3 text-[#9b6927]">
              <AlertCircle className="h-5 w-5" />
            </div>

          </div>

        </div>


        <div className="rounded-[20px] border border-[#eadfe4] border-t-4 border-t-[#10b981] bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#756b70]">
                Resolved
              </p>

              <h2 className="mt-2 font-heading text-3xl font-bold text-[#5d0f2d]">
                7
              </h2>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>

          </div>

        </div>

      </div>


      {/* Notifications */}
      <div className="rounded-[22px] border border-[#eadfe4] bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-[#f0e6ea] p-6">

          <div>
            <h2 className="font-heading text-xl font-bold text-[#5d0f2d]">
              Recent Notifications
            </h2>

            <p className="mt-1 text-xs text-[#756b70]">
              Your latest faculty portal updates
            </p>
          </div>

          <button className="rounded-xl bg-[#5d0f2d] px-4 py-2 text-xs font-bold text-white hover:bg-[#8a164b]">
            Mark All Read
          </button>

        </div>


        <div className="divide-y divide-[#f0e6ea]">

          {/* Notification 1 */}
          <div className="flex gap-4 p-5 transition hover:bg-[#fffafb]">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f5e6ec] text-[#8a164b]">
              <Bell className="h-5 w-5" />
            </div>

            <div className="flex-1">

              <div className="flex flex-col justify-between gap-1 sm:flex-row">

                <h3 className="font-semibold text-[#3d2b2b]">
                  New student doubt received
                </h3>

                <span className="text-xs text-[#9a8f94]">
                  10 min ago
                </span>

              </div>

              <p className="mt-1 text-sm text-[#756b70]">
                A student has submitted a new doubt regarding React Router.
              </p>

            </div>

          </div>


          {/* Notification 2 */}
          <div className="flex gap-4 bg-[#fffafb] p-5">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f4e3c1] text-[#9b6927]">
              <AlertCircle className="h-5 w-5" />
            </div>

            <div className="flex-1">

              <div className="flex flex-col justify-between gap-1 sm:flex-row">

                <h3 className="font-semibold text-[#3d2b2b]">
                  Assignment deadline approaching
                </h3>

                <span className="text-xs text-[#9a8f94]">
                  1 hour ago
                </span>

              </div>

              <p className="mt-1 text-sm text-[#756b70]">
                Full Stack Development assignment deadline is tomorrow.
              </p>

            </div>

          </div>


          {/* Notification 3 */}
          <div className="flex gap-4 p-5 transition hover:bg-[#fffafb]">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Info className="h-5 w-5" />
            </div>

            <div className="flex-1">

              <div className="flex flex-col justify-between gap-1 sm:flex-row">

                <h3 className="font-semibold text-[#3d2b2b]">
                  Faculty portal update
                </h3>

                <span className="text-xs text-[#9a8f94]">
                  Yesterday
                </span>

              </div>

              <p className="mt-1 text-sm text-[#756b70]">
                New faculty dashboard features are now available.
              </p>

            </div>

          </div>


          {/* Notification 4 */}
          <div className="flex gap-4 p-5 transition hover:bg-[#fffafb]">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div className="flex-1">

              <div className="flex flex-col justify-between gap-1 sm:flex-row">

                <h3 className="font-semibold text-[#3d2b2b]">
                  Attendance successfully recorded
                </h3>

                <span className="text-xs text-[#9a8f94]">
                  Yesterday
                </span>

              </div>

              <p className="mt-1 text-sm text-[#756b70]">
                Your faculty attendance for yesterday has been recorded successfully.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}