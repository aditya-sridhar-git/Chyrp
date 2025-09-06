
from flask import Blueprint, request, jsonify, session
from flask_cors import cross_origin
from app import db
from app.models import User, Blog, Like, Comment
from datetime import datetime
from functools import wraps
import json
import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from cloudinary.utils import cloudinary_url
from werkzeug.utils import secure_filename
from flask import send_from_directory

main = Blueprint('main', __name__)

# Configure Cloudinary (add this near the top of your routes.py)
cloudinary.config(
    cloud_name="dkg8ij6e8",
    api_key=499763243231175,
    api_secret="SKx7jSzHzhxEd5kkNHnQWh3ixzE"
)


# Add these configuration variables at the top of the file
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'mov', 'avi', 'wmv', 'webm'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@main.route('/uploads/<path:filename>')
@cross_origin(supports_credentials=True)
def uploaded_file(filename):
    try:
        # Get the absolute path to uploads directory
        base_upload_dir = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads')
        
        path_parts = filename.split('/')
        if len(path_parts) >= 2:
            user_id = path_parts[0]
            actual_filename = '/'.join(path_parts[1:])
            user_upload_dir = os.path.join(base_upload_dir, user_id)
            
            # Check if file exists
            file_path = os.path.join(user_upload_dir, actual_filename)
            if not os.path.exists(file_path):
                print(f"File not found: {file_path}")
                return jsonify({"error": "File not found"}), 404
                
            return send_from_directory(user_upload_dir, actual_filename)
        else:
            # Fallback to direct path
            file_path = os.path.join(base_upload_dir, filename)
            if not os.path.exists(file_path):
                print(f"File not found: {file_path}")
                return jsonify({"error": "File not found"}), 404
                
            return send_from_directory(base_upload_dir, filename)
    except Exception as e:
        print(f"Error serving file {filename}: {str(e)}")
        return jsonify({"error": "File serving error"}), 500
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"message": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

@main.route('/')
def index():
    return jsonify({"message": "Blog API is running!"})

@main.route('/register', methods=['POST'])
@cross_origin(supports_credentials=True)
def register():
    try:
        data = request.get_json()
        print("Registration data received:", data)
        
        if not data or 'username' not in data or 'email' not in data or 'password' not in data:
            print("Missing required fields")
            return jsonify({"message": "Missing required fields"}), 400
        
        if User.query.filter_by(username=data['username']).first():
            print("Username already exists")
            return jsonify({"message": "Username already exists"}), 400
            
        if User.query.filter_by(email=data['email']).first():
            print("Email already exists")
            return jsonify({"message": "Email already exists"}), 400
            
        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        print("User created successfully")
        return jsonify({"message": "User created successfully"}), 201
        
    except Exception as e:
        print("Error in registration:", str(e))
        return jsonify({"message": "Server error during registration"}), 500

@main.route('/login', methods=['POST'])
@cross_origin(supports_credentials=True)
def login():
    try:
        data = request.get_json()
        print(f"Login attempt for username: {data.get('username')}")
        
        user = User.query.filter_by(username=data['username']).first()
        
        if user and user.check_password(data['password']):
            # Set session
            session['user_id'] = user.id
            session['username'] = user.username
            session['email'] = user.email
            session.permanent = True
            
            print(f"Login successful for user: {user.username}, user ID: {user.id}")
            
            return jsonify({
                "message": "Login successful",
                "user_id": user.id,
                "username": user.username,
                "email": user.email
            }), 200
        else:
            print("Login failed: Invalid credentials")
            return jsonify({"message": "Invalid credentials"}), 401
            
    except Exception as e:
        print(f"Error in login route: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "Server error during login"}), 500

@main.route('/dashboard', methods=['GET'])
@login_required
@cross_origin(supports_credentials=True)
def dashboard():
    try:
        user_id = session.get('user_id')
        print(f"Dashboard requested for user ID: {user_id}")
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        blogs = Blog.query.filter_by(user_id=user_id).order_by(Blog.created_at.desc()).all()
        
        blog_list = []
        for blog in blogs:
            blog_list.append({
                'id': blog.id,
                'title': blog.title,
                'content': blog.content,
                'created_at': blog.created_at.strftime('%Y-%m-%d %H:%M')
            })
        
        return jsonify({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            },
            "blogs": blog_list
        }), 200
        
    except Exception as e:
        print(f"Error in dashboard route: {str(e)}")
        return jsonify({"message": "Server error"}), 500

@main.route('/logout', methods=['POST'])
@login_required
@cross_origin(supports_credentials=True)
def logout():
    try:
        session.clear()
        return jsonify({"message": "Logged out successfully"}), 200
    except Exception as e:
        print(f"Error in logout route: {str(e)}")
        return jsonify({"message": "Server error during logout"}), 500

@main.route('/check_auth', methods=['GET'])
@cross_origin(supports_credentials=True)
def check_auth():
    if 'user_id' in session:
        return jsonify({
            "authenticated": True,
            "user_id": session.get('user_id'),
            "username": session.get('username')
        }), 200
    else:
        return jsonify({"authenticated": False}), 200




# Update the create_blog route to handle videos
# No changes needed to the create_blog route since we're now sending HTML content
# But we need to make sure the content is properly stored and retrieved

@main.route('/create_blog', methods=['POST'])
@login_required
@cross_origin(supports_credentials=True)
def create_blog():
    try:
        user_id = session.get('user_id')
        
        if 'title' not in request.form:
            return jsonify({"message": "Title is required"}), 400
            
        title = request.form['title']
        content = request.form.get('content', '')
        
        # Create the blog with HTML content
        blog = Blog(
            title=title, 
            content=content,  # Store as HTML
            user_id=user_id
        )
        
        db.session.add(blog)
        db.session.commit()
        
        return jsonify({
            "message": "Blog created successfully",
            "blog_id": blog.id
        }), 201
        
    except Exception as e:
        print(f"Error creating blog: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "Server error during blog creation"}), 500

# Update the get_blog route to include like information
@main.route('/blog/<int:blog_id>', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_blog(blog_id):
    try:
        blog = Blog.query.get(blog_id)
        
        if not blog:
            return jsonify({"message": "Blog not found"}), 404
        
        # Check if user is logged in and has liked this blog
        user_has_liked = False
        if 'user_id' in session:
            user_has_liked = Like.query.filter_by(
                blog_id=blog_id, 
                user_id=session['user_id']
            ).first() is not None
        
        # Get like count
        like_count = Like.query.filter_by(blog_id=blog_id).count()
        
        # Get comment count
        comment_count = Comment.query.filter_by(blog_id=blog_id).count()
        
        # Get author username
        author = User.query.get(blog.user_id)
        author_username = author.username if author else "Unknown"
        
        blog_data = {
            "id": blog.id,
            "title": blog.title,
            "content": blog.content,
            "created_at": blog.created_at.strftime('%Y-%m-%d %H:%M'),
            "author_username": author_username,
            "likes_count": like_count,
            "comments_count": comment_count,
            "liked": user_has_liked
        }
        
        # Return full content for all users (or modify as needed)
        return jsonify(blog_data), 200
            
    except Exception as e:
        print(f"Error fetching blog: {str(e)}")
        return jsonify({"message": "Server error"}), 500

# Add this route to your routes.py file
@main.route('/blog/<int:blog_id>', methods=['DELETE'])
@login_required
@cross_origin(supports_credentials=True)
def delete_blog(blog_id):
    try:
        blog = Blog.query.get(blog_id)
        
        if not blog:
            return jsonify({"message": "Blog not found"}), 404
            
        # Check if the current user owns the blog
        if blog.user_id != session.get('user_id'):
            return jsonify({"message": "Unauthorized"}), 403
            
        # TODO: Add code to delete associated files from Cloudinary if needed
        
        db.session.delete(blog)
        db.session.commit()
        
        return jsonify({"message": "Blog deleted successfully"}), 200
            
    except Exception as e:
        print(f"Error deleting blog: {str(e)}")
        return jsonify({"message": "Server error"}), 500

# Add these routes to your routes.py file

# Get all blogs for feed
# Update the feed route in routes.py
@main.route('/feed', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_feed():
    try:
        # Get all blogs with author information using proper SQLAlchemy query
        blogs = db.session.query(
            Blog.id,
            Blog.title,
            Blog.content,
            Blog.created_at,
            User.username.label('author_username')
        ).join(User, Blog.user_id == User.id).order_by(Blog.created_at.desc()).all()
        
        blog_list = []
        for blog in blogs:
            # Get like count for this blog
            like_count = db.session.query(Like).filter(Like.blog_id == blog.id).count()
            
            # Get comment count for this blog
            comment_count = db.session.query(Comment).filter(Comment.blog_id == blog.id).count()
            
            blog_list.append({
                'id': blog.id,
                'title': blog.title,
                'content': blog.content,
                'created_at': blog.created_at.strftime('%Y-%m-%d %H:%M'),
                'author_username': blog.author_username,
                'likes_count': like_count,
                'comments_count': comment_count
            })
        
        return jsonify({
            "blogs": blog_list
        }), 200
        
    except Exception as e:
        print(f"Error fetching feed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "Server error"}), 500

@main.route('/blog/<int:blog_id>/like', methods=['OPTIONS'])
@cross_origin(supports_credentials=True)
def like_blog_options(blog_id):
    return jsonify({}), 200

# Update the like_blog route to handle both like and unlike
@main.route('/blog/<int:blog_id>/like', methods=['POST'])
@login_required
@cross_origin(supports_credentials=True)
def like_blog(blog_id):
    try:
        user_id = session.get('user_id')
        
        # Check if user already liked this blog
        existing_like = Like.query.filter_by(blog_id=blog_id, user_id=user_id).first()
        
        if existing_like:
            # User already liked, so remove the like (unlike)
            db.session.delete(existing_like)
            db.session.commit()
            
            # Get updated like count
            like_count = Like.query.filter_by(blog_id=blog_id).count()
            
            return jsonify({
                "message": "Blog unliked successfully",
                "liked": False,
                "likes_count": like_count
            }), 200
        else:
            # User hasn't liked yet, so add like
            like = Like(blog_id=blog_id, user_id=user_id)
            db.session.add(like)
            db.session.commit()
            
            # Get updated like count
            like_count = Like.query.filter_by(blog_id=blog_id).count()
            
            return jsonify({
                "message": "Blog liked successfully",
                "liked": True,
                "likes_count": like_count
            }), 200
            
    except Exception as e:
        print(f"Error liking blog: {str(e)}")
        return jsonify({"message": "Server error"}), 500

# Get comments for a blog
# Update the get_comments route
@main.route('/blog/<int:blog_id>/comments', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_comments(blog_id):
    try:
        comments = db.session.query(
            Comment.id,
            Comment.content,
            Comment.created_at,
            User.username.label('author_username')
        ).join(User, Comment.user_id == User.id).filter(Comment.blog_id == blog_id).order_by(Comment.created_at.asc()).all()
        
        comment_list = []
        for comment in comments:
            comment_list.append({
                'id': comment.id,
                'content': comment.content,
                'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M'),
                'author_username': comment.author_username
            })
        
        return jsonify({
            "comments": comment_list
        }), 200
        
    except Exception as e:
        print(f"Error fetching comments: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "Server error"}), 500

@main.route('/blog/<int:blog_id>/comment', methods=['OPTIONS'])
@cross_origin(supports_credentials=True)
def comment_blog_options(blog_id):
    return jsonify({}), 200

@main.route('/blog/<int:blog_id>/comment', methods=['POST'])
@login_required
@cross_origin(supports_credentials=True)
def add_comment(blog_id):
    try:
        user_id = session.get('user_id')
        data = request.get_json()
        
        if not data or 'content' not in data or not data['content'].strip():
            return jsonify({"message": "Comment content is required"}), 400
            
        comment = Comment(
            content=data['content'].strip(),
            blog_id=blog_id,
            user_id=user_id
        )
        
        db.session.add(comment)
        db.session.commit()
        
        # Get the comment with author info
        new_comment = db.session.query(
            Comment.id,
            Comment.content,
            Comment.created_at,
            User.username.label('author_username')
        ).join(User, Comment.user_id == User.id).filter(Comment.id == comment.id).first()
        
        return jsonify({
            "message": "Comment added successfully",
            "comment": {
                'id': new_comment.id,
                'content': new_comment.content,
                'created_at': new_comment.created_at.strftime('%Y-%m-%d %H:%M'),
                'author_username': new_comment.author_username
            }
        }), 201
        
    except Exception as e:
        print(f"Error adding comment: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "Server error"}), 500





# Update the simple_feed endpoint
# Update the simple_feed route to include like information
@main.route('/simple_feed', methods=['GET'])
@cross_origin(supports_credentials=True)
def simple_feed():
    try:
        # First, just get basic blogs without any joins
        blogs = Blog.query.order_by(Blog.created_at.desc()).all()
        
        blog_list = []
        for blog in blogs:
            # Get author username directly
            author = User.query.get(blog.user_id)
            author_username = author.username if author else "Unknown"
            
            # Get counts
            like_count = Like.query.filter_by(blog_id=blog.id).count()
            comment_count = Comment.query.filter_by(blog_id=blog.id).count()
            
            # Check if current user has liked this blog
            user_has_liked = False
            if 'user_id' in session:
                user_has_liked = Like.query.filter_by(
                    blog_id=blog.id, 
                    user_id=session['user_id']
                ).first() is not None
            
            blog_list.append({
                'id': blog.id,
                'title': blog.title,
                'content': blog.content,
                'created_at': blog.created_at.strftime('%Y-%m-%d %H:%M'),
                'author_username': author_username,
                'likes_count': like_count,
                'comments_count': comment_count,
                'liked': user_has_liked
            })
        
        return jsonify({"blogs": blog_list}), 200
        
    except Exception as e:
        print(f"Simple feed error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": f"Simple feed error: {str(e)}"}), 500

# Fallback feed endpoint with minimal queries
@main.route('/minimal_feed', methods=['GET'])
@cross_origin(supports_credentials=True)
def minimal_feed():
    try:
        # Just return basic blog info without counts
        blogs = Blog.query.order_by(Blog.created_at.desc()).all()
        
        blog_list = []
        for blog in blogs:
            author = User.query.get(blog.user_id)
            
            blog_list.append({
                'id': blog.id,
                'title': blog.title,
                'preview': blog.content[:100] + '...' if len(blog.content) > 100 else blog.content,
                'created_at': blog.created_at.strftime('%Y-%m-%d %H:%M'),
                'author_username': author.username if author else 'Unknown'
            })
        
        return jsonify({"blogs": blog_list}), 200
        
    except Exception as e:
        print(f"Minimal feed error: {str(e)}")
        return jsonify({"message": "Could not load feed"}), 500
