from pymongo import MongoClient, UpdateOne
from cario.core.config import settings

MENTORS=[
 {"name":"Nguyễn Hải Nam","title":"Data Engineer","field":"Dữ liệu","skills":["SQL","Python","Data pipeline"],"experience":"5 năm xây dựng hệ thống dữ liệu","achievement":"Dẫn dắt 3 dự án dữ liệu cho doanh nghiệp vừa và nhỏ","bio":"Hỗ trợ người mới biến bài tập dữ liệu thành portfolio."},
 {"name":"Trần Mai Anh","title":"Product Designer","field":"Thiết kế","skills":["UX research","Figma","Design system"],"experience":"6 năm thiết kế sản phẩm số","achievement":"Xây design system cho sản phẩm giáo dục","bio":"Thích góp ý case study và portfolio cho sinh viên."},
 {"name":"Lê Quang Huy","title":"Security Analyst","field":"Bảo mật","skills":["Network security","SOC","Risk analysis"],"experience":"4 năm vận hành an ninh mạng","achievement":"Tổ chức các buổi lab an toàn thông tin cho sinh viên","bio":"Đồng hành cùng người mới bắt đầu security."},
]
def main():
 if not settings.mongodb_url: raise RuntimeError("MONGODB_URL is not configured.")
 client=MongoClient(settings.mongodb_url); c=client["Cario"]["mentor"]; c.create_index("name",unique=True); c.bulk_write([UpdateOne({"name":x["name"]},{"$set":x},upsert=True) for x in MENTORS]); print({"mentor":c.count_documents({})}); client.close()
if __name__=="__main__": main()
